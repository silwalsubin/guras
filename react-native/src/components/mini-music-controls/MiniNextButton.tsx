import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { AudioFile } from '@/services/api';

export const MiniNextButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  const loadTrack = async (audioFile: AudioFile, index: number, wasPlaying: boolean) => {
    try {
      const track = {
        id: audioFile.id || audioFile.fileName || audioFile.name,
        url: audioFile.audioDownloadUrl || audioFile.downloadUrl,
        title: audioFile.name || audioFile.title || (audioFile.fileName ? audioFile.fileName.replace(/\.[^/.]+$/, "") : 'Unknown Track'),
        artist: audioFile.author || audioFile.artist || 'Guras',
      };

      // Update Redux state
      dispatch(setCurrentTrack({ ...track, artworkUrl: audioFile.thumbnailDownloadUrl || audioFile.artworkUrl || null }));
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
      console.error('❌ Failed to load next track:', error);
      return false;
    }
  };

  const handleNextTrack = async () => {
    try {
      if (audioFiles.length <= 1) {
        return; // Silently do nothing for mini player
      }

      // Check current playback state BEFORE resetting
      const currentState = await TrackPlayer.getState();
      const wasPlaying = currentState === State.Playing;

      // Calculate next track index
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      const nextTrack = audioFiles[nextIndex];
      
      // Load the actual track
      const success = await loadTrack(nextTrack, nextIndex, wasPlaying);
      if (!success) {
        Alert.alert('Error', 'Failed to load next track.');
      }
    } catch (error) {
      console.error('❌ Error in MiniNextButton:', error);
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
      onPress={handleNextTrack}
      disabled={!hasMultipleTracks}
    >
      <FontAwesome name="step-forward" size={14} color={brandColors.primary} />
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

export default MiniNextButton;
