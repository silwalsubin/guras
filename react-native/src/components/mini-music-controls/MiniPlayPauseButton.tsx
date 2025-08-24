import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors } from '@/config/colors';

export const MiniPlayPauseButton: React.FC = () => {
  const {
    togglePlayback,
    isSetup,
    isPlaying,
    currentTrack,
    audioFiles
  } = useMusicPlayer();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const brandColors = getBrandColors();



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

      // Use context's togglePlayback - it will handle queue management
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
