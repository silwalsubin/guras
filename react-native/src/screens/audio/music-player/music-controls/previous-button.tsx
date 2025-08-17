import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { apiService, AudioFile } from '@/services/api';

const PreviousButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const brandColors = getBrandColors();

  const loadTrack = async (audioFile: AudioFile, index: number, wasPlaying: boolean) => {
    try {
      console.log('🎵 Loading previous track:', audioFile.title || audioFile.fileName);
      console.log('🎵 Previous track was playing:', wasPlaying);
      
      const track = {
        id: audioFile.fileName,
        url: audioFile.downloadUrl,
        title: audioFile.title ?? audioFile.fileName.replace(/\.[^/.]+$/, ""),
        artist: audioFile.artist ?? 'Guras',
      };

      // Update Redux state
      dispatch(setCurrentTrack({ ...track, artworkUrl: audioFile.artworkUrl ?? null }));
      dispatch(setCurrentTrackIndex(index));

      // Load track into TrackPlayer
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      
      const queue = await TrackPlayer.getQueue();
      console.log('✅ Previous track loaded successfully. Queue length:', queue.length);
      
      // Auto-play based on previous state
      if (wasPlaying) {
        // Auto-play the new track if previous was playing
        await TrackPlayer.play();
        console.log('🎵 Auto-playing previous track (was playing)');
      } else {
        console.log('🎵 Previous track loaded in paused state (was paused)');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load previous track:', error);
      return false;
    }
  };

  const handlePreviousTrack = async () => {
    try {
      if (audioFiles.length <= 1) {
        Alert.alert('No Previous Track', 'This is the first track.');
        return;
      }

      // Check current playback state BEFORE resetting
      const currentState = await TrackPlayer.getState();
      const wasPlaying = currentState === State.Playing;
      console.log('🎵 Current TrackPlayer state before navigation:', currentState, 'wasPlaying:', wasPlaying);

      // Calculate previous track index
      const prevIndex = currentTrackIndex === 0 ? audioFiles.length - 1 : currentTrackIndex - 1;
      const prevTrack = audioFiles[prevIndex];
      
      console.log('🎵 Navigating to previous track:', prevIndex, prevTrack.title || prevTrack.fileName);
      
      // Load the actual track (this will update Redux state)
      const success = await loadTrack(prevTrack, prevIndex, wasPlaying);
      if (!success) {
        Alert.alert('Error', 'Failed to load previous track.');
      }
    } catch (error) {
      console.error('❌ Error in PreviousButton:', error);
      Alert.alert('Error', 'Failed to navigate to previous track.');
    }
  };

  const hasMultipleTracks = audioFiles.length > 1;

  return (
    <TouchableOpacity
      style={[styles.navButton, { opacity: hasMultipleTracks ? 1 : 0.3 }]}
      onPress={handlePreviousTrack}
      disabled={!hasMultipleTracks}
    >
      <FontAwesome name="step-backward" size={28} color={brandColors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default PreviousButton;
