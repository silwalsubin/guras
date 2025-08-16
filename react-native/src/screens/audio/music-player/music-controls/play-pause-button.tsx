import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { apiService, AudioFile } from '@/services/api';

const PlayPauseButton: React.FC = () => {
  const { togglePlayback, isSetup } = useMusicPlayer();
  const { isPlaying, audioFiles, currentTrack, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const brandColors = getBrandColors();

  const loadTrackManually = async (audioFile: AudioFile, index: number) => {
    try {
      console.log('🎵 Manually loading track:', audioFile.title || audioFile.fileName);
      
      const track = {
        id: audioFile.fileName,
        url: audioFile.downloadUrl,
        title: audioFile.title ?? audioFile.fileName.replace(/\.[^/.]+$/, ""),
        artist: audioFile.artist ?? 'Guras',
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
      // Debug: Check TrackPlayer state
      const playerState = await TrackPlayer.getState();
      const queue = await TrackPlayer.getQueue();
      const currentTrackIndex = await TrackPlayer.getCurrentTrack();
      
      console.log('🔍 Debug PlayPauseButton:', {
        playerState,
        queueLength: queue.length,
        currentTrackIndex,
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

      // Check if TrackPlayer has tracks in queue
      if (queue.length === 0) {
        console.log('⚠️ No tracks in queue, attempting to load manually...');
        
        // Try to manually load the current track
        if (currentTrack && currentTrackIndex !== null && currentTrackIndex >= 0 && currentTrackIndex < audioFiles.length) {
          const success = await loadTrackManually(audioFiles[currentTrackIndex], currentTrackIndex);
          if (!success) {
            Alert.alert('Load Failed', 'Failed to load track into player. Please try again.');
            return;
          }
        } else {
          Alert.alert('No Track Loaded', 'No track is currently loaded in the player.');
          return;
        }
      }

      // Check if we have a current track
      if (!currentTrack) {
        Alert.alert('No Track Loaded', 'No track is currently loaded in the player.');
        return;
      }

      // Try to toggle playback
      console.log('🎵 Attempting to toggle playback...');
      await togglePlayback();
      
      // Debug: Check state after toggle
      const newPlayerState = await TrackPlayer.getState();
      console.log('✅ After toggle - Player state:', newPlayerState);
      
    } catch (error) {
      console.error('❌ Error in PlayPauseButton:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      Alert.alert('Playback Error', `Failed to toggle playback: ${errorMessage}`);
    }
  };

  return (
    <TouchableOpacity style={styles.playPauseButton} onPress={handlePress}>
      <FontAwesome name={isPlaying ? 'pause' : 'play'} size={32} color={brandColors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  playPauseButton: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});

export default PlayPauseButton;
