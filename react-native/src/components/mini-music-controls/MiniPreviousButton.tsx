import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { AudioFile } from '@/services/api';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

export const MiniPreviousButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { playTrack } = useMusicPlayer();
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);



  const handlePreviousTrack = async () => {
    try {
      if (audioFiles.length <= 1) {
        return; // Silently do nothing for mini player
      }

      // Calculate previous track index
      const prevIndex = currentTrackIndex === 0 ? audioFiles.length - 1 : currentTrackIndex - 1;
      const prevAudioFile = audioFiles[prevIndex];

      // Convert to TrackInfo format for context
      const track = {
        id: prevAudioFile.id,
        title: prevAudioFile.name,
        artist: prevAudioFile.author,
        url: prevAudioFile.audioDownloadUrl,
        artwork: prevAudioFile.thumbnailDownloadUrl || undefined,
        duration: prevAudioFile.durationSeconds || 0,
      };

      // Update Redux state with both track info and index
      dispatch(setCurrentTrack({
        id: prevAudioFile.id,
        title: prevAudioFile.name,
        artist: prevAudioFile.author,
        url: prevAudioFile.audioDownloadUrl,
        artworkUrl: prevAudioFile.thumbnailDownloadUrl || null,
      }));
      dispatch(setCurrentTrackIndex(prevIndex));

      // Use context to play track (this will update UI properly)
      await playTrack(track);

      console.log('🎵 Previous track loaded:', track.title);
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
