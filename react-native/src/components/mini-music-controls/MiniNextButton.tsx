import React, { useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { AudioFile } from '@/services/api';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

export const MiniNextButton: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  // Disabled for now - focusing on single track meditation music
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);





  const handleNextTrack = async () => {
    // Disabled for now - focusing on single track meditation music
    console.log('🎵 Next track disabled for meditation music');
  };

  const hasMultipleTracks = false; // Disabled for meditation music

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
