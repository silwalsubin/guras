import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { AudioFile } from '@/services/api';

export const MiniPreviousButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  const loadTrack = async (audioFile: AudioFile, index: number, wasPlaying: boolean) => {
    try {
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
      
      // Auto-play based on previous state
      if (wasPlaying) {
        await TrackPlayer.play();
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
        return; // Silently do nothing for mini player
      }

      // Check current playback state BEFORE resetting
      const currentState = await TrackPlayer.getState();
      const wasPlaying = currentState === State.Playing;

      // Calculate previous track index
      const prevIndex = currentTrackIndex === 0 ? audioFiles.length - 1 : currentTrackIndex - 1;
      const prevTrack = audioFiles[prevIndex];
      
      // Load the actual track
      const success = await loadTrack(prevTrack, prevIndex, wasPlaying);
      if (!success) {
        Alert.alert('Error', 'Failed to load previous track.');
      }
    } catch (error) {
      console.error('❌ Error in MiniPreviousButton:', error);
    }
  };

  const hasMultipleTracks = audioFiles.length > 1;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          opacity: hasMultipleTracks ? 1 : 0.3,
          backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
        }
      ]}
      onPress={handlePreviousTrack}
      disabled={!hasMultipleTracks}
    >
      <FontAwesome name="step-backward" size={14} color={brandColors.primary} />
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

export default MiniPreviousButton;
