import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors } from '@/config/colors';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

export const MiniNextButton: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { currentTrackIndex, audioFiles } = useSelector((state: RootState) => state.musicPlayer);
  const dispatch = useDispatch();
  const { playTrack, activeMeditationTrack } = useMusicPlayer();

  const brandColors = getBrandColors();

  const handleNextTrack = async () => {
    // Don't allow track navigation during meditation
    if (activeMeditationTrack) {
      console.log('🎵 Next track disabled during meditation');
      return;
    }

    try {
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      const nextAudioFile = audioFiles[nextIndex];

      // Convert to TrackInfo format for context
      const track = {
        id: nextAudioFile.id,
        title: nextAudioFile.name,
        artist: nextAudioFile.author,
        url: nextAudioFile.audioDownloadUrl,
        artwork: nextAudioFile.thumbnailDownloadUrl || undefined,
        duration: nextAudioFile.durationSeconds || 0,
      };

      // Update Redux state with both track info and index
      dispatch(setCurrentTrack({
        id: nextAudioFile.id,
        title: nextAudioFile.name,
        artist: nextAudioFile.author,
        url: nextAudioFile.audioDownloadUrl,
        artworkUrl: nextAudioFile.thumbnailDownloadUrl || null,
      }));
      dispatch(setCurrentTrackIndex(nextIndex));

      // Use context to play track (this will update UI properly)
      await playTrack(track);

      console.log('🎵 Next track loaded:', track.title);
    } catch (error) {
      console.error('❌ Error in MiniNextButton:', error);
    }
  };

  // Enable if we have multiple tracks and not in meditation
  const hasMultipleTracks = audioFiles?.length > 1 && !activeMeditationTrack;

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