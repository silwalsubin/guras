import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';

export const MiniPlayPauseButton: React.FC = () => {
  const { togglePlayback, isSetup, isPlaying, currentTrack } = useMusicPlayer();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const dispatch = useDispatch();
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  // Load track into TrackPlayer
  const loadTrack = async (audioFile: any, index: number) => {
    try {
      console.log('🎵 Mini Player: Loading track:', audioFile.name || audioFile.title || audioFile.fileName);

      // Create track object for TrackPlayer
      const track = {
        id: audioFile.id || audioFile.fileName || audioFile.name,
        url: audioFile.audioDownloadUrl || audioFile.downloadUrl,
        title: audioFile.name || audioFile.title || (audioFile.fileName ? audioFile.fileName.replace(/\.[^/.]+$/, "") : 'Unknown Track'),
        artist: audioFile.author || audioFile.artist || 'Guras',
      };

      console.log('🎵 Mini Player: Track object created:', track);

      dispatch(setCurrentTrack({ ...track, artworkUrl: audioFile.thumbnailDownloadUrl || audioFile.artworkUrl || null }));
      dispatch(setCurrentTrackIndex(index));

      // Stop current playback and load new track
      console.log('🎵 Mini Player: Resetting TrackPlayer...');
      await TrackPlayer.reset();

      console.log('🎵 Mini Player: Adding track to queue...');
      await TrackPlayer.add(track);

      // Verify track was added
      const queue = await TrackPlayer.getQueue();
      console.log('✅ Mini Player: Track added successfully. Queue length:', queue.length);

    } catch (error) {
      console.error('❌ Mini Player: Error loading audio file:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const handlePlayPause = async () => {
    try {
      if (!isSetup) {
        Alert.alert('Player Not Ready', 'Music player is still setting up. Please wait a moment.');
        return;
      }

      if (!currentTrack || audioFiles.length === 0) {
        Alert.alert('No Track', 'No track is currently loaded.');
        return;
      }

      // Check if there's a track in the queue
      const queue = await TrackPlayer.getQueue();
      if (queue.length === 0) {
        console.log('🎵 Mini Player: No track in queue, loading current track...');
        // Load the current track from Redux state
        const audioFile = audioFiles[currentTrackIndex];
        if (audioFile) {
          await loadTrack(audioFile, currentTrackIndex);
          // After loading, start playback
          await TrackPlayer.play();
          return;
        } else {
          Alert.alert('No Track', 'No track is currently loaded in the player.');
          return;
        }
      }

      await togglePlayback();
    } catch (error) {
      console.error('❌ Error in MiniPlayPauseButton:', error);
      Alert.alert('Error', 'Failed to toggle playback.');
    }
  };

  const hasTrack = currentTrack && audioFiles.length > 0;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          opacity: hasTrack ? 1 : 0.3,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }
      ]}
      onPress={handlePlayPause}
      disabled={!hasTrack}
    >
      <FontAwesome
        name={isPlaying ? "pause" : "play"}
        size={16}
        color={brandColors.primary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    width: 32,
    height: 32,
  },
});

export default MiniPlayPauseButton;
