import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors } from '@/config/colors';
import TrackPlayer from 'react-native-track-player';
import { apiService, AudioFile } from '@/services/api';
import { State } from 'react-native-track-player';

const NextButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const brandColors = getBrandColors();

  const loadTrack = async (audioFile: AudioFile, index: number, wasPlaying: boolean) => {
    try {
      console.log('🎵 Loading next track:', audioFile.title || audioFile.fileName);
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
      console.log('✅ Next track loaded successfully. Queue length:', queue.length);
      
      // Auto-play based on previous state
      if (wasPlaying) {
        // Auto-play the new track if previous was playing
        await TrackPlayer.play();
        console.log('🎵 Auto-playing next track (was playing)');
      } else {
        console.log('🎵 Next track loaded in paused state (was paused)');
      }
      
      return true;
    } catch (error) {
      console.error('❌ Failed to load next track:', error);
      return false;
    }
  };

  const handleNextTrack = async () => {
    try {
      if (audioFiles.length <= 1) {
        Alert.alert('No Next Track', 'This is the last track.');
        return;
      }

      // Check current playback state BEFORE resetting
      const currentState = await TrackPlayer.getState();
      const wasPlaying = currentState === State.Playing;
      console.log('🎵 Current TrackPlayer state before navigation:', currentState, 'wasPlaying:', wasPlaying);

      // Calculate next track index
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      const nextTrack = audioFiles[nextIndex];
      
      console.log('🎵 Navigating to next track:', nextIndex, nextTrack.title || nextTrack.fileName);
      
      // Load the actual track (this will update Redux state)
      const success = await loadTrack(nextTrack, nextIndex, wasPlaying);
      if (!success) {
        Alert.alert('Error', 'Failed to load next track.');
      }
    } catch (error) {
      console.error('❌ Error in NextButton:', error);
      Alert.alert('Error', 'Failed to navigate to next track.');
    }
  };

  const hasMultipleTracks = audioFiles.length > 1;

  return (
    <TouchableOpacity 
      style={[styles.navButton, { opacity: hasMultipleTracks ? 1 : 0.3 }]} 
      onPress={handleNextTrack}
      disabled={!hasMultipleTracks}
    >
      <FontAwesome name="step-forward" size={24} color={brandColors.primary} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navButton: {
    padding: 12,
    borderRadius: 8,
  },
});

export default NextButton;
