import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors, COLORS } from '@/config/colors';
import TrackPlayer from 'react-native-track-player';
import { AudioFile } from '@/services/api';

const PlayPauseButton: React.FC = () => {
  const {
    togglePlayback,
    isSetup,
    isPlaying,
    audioFiles,
    currentTrack,
    currentTrackIndex
  } = useMusicPlayer();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  const loadTrackManually = async (audioFile: AudioFile, index: number) => {
    try {
      console.log('🎵 Manually loading track:', audioFile.name || audioFile.title || audioFile.fileName);

      const track = {
        id: audioFile.id || audioFile.fileName || audioFile.name,
        url: audioFile.audioDownloadUrl || audioFile.downloadUrl,
        title: audioFile.name || audioFile.title || (audioFile.fileName ? audioFile.fileName.replace(/\.[^/.]+$/, "") : 'Unknown Track'),
        artist: audioFile.author || audioFile.artist || 'Guras',
      };

      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      
      const queue = await TrackPlayer.getQueue();
      console.log('✅ Manual track load successful. Queue length:', queue.length);
      
      return true;
    } catch (error) {
      console.error('❌ Manual track load failed:', error);
      return false;
    }
  };

  const handlePress = async () => {
    try {
      console.log('🔍 Debug PlayPauseButton:', {
        isSetup,
        audioFilesLength: audioFiles.length,
        currentTrack: currentTrack?.title,
        isPlaying
      });

      // Check if we have tracks loaded
      if (audioFiles.length === 0) {
        Alert.alert('No Tracks', 'No audio tracks are available to play.');
        return;
      }

      // Check if TrackPlayer is ready
      if (!isSetup) {
        Alert.alert('Player Not Ready', 'Audio player is still initializing. Please wait.');
        return;
      }

      // Check if we have a current track
      if (!currentTrack) {
        Alert.alert('No Track Loaded', 'No track is currently loaded in the player.');
        return;
      }

      // Toggle playback - the context will handle queue management
      console.log('🎵 Attempting to toggle playback...');
      await togglePlayback();
      console.log('✅ Playback toggled successfully');
      
    } catch (error) {
      console.error('❌ Error in PlayPauseButton:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Playback Error', `Failed to toggle playback: ${errorMessage}`);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.playPauseButton,
        {
          backgroundColor: brandColors.primary,
          shadowColor: COLORS.SHADOW,
        }
      ]}
      onPress={handlePress}
    >
      <FontAwesome
        name={isPlaying ? 'pause' : 'play'}
        size={28}
        color={isDarkMode ? '#000' : '#fff'}
        style={!isPlaying && { marginLeft: 2 }} // Adjust play icon position
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playPauseButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default PlayPauseButton;
