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
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const NextButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const { playTrack } = useMusicPlayer();
  const brandColors = getBrandColors();



  const handleNextTrack = async () => {
    try {
      if (audioFiles.length <= 1) {
        Alert.alert('No Next Track', 'This is the last track.');
        return;
      }

      // Calculate next track index
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      const nextAudioFile = audioFiles[nextIndex];

      console.log('🎵 Navigating to next track:', nextIndex, nextAudioFile.name);

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
      <FontAwesome name="step-forward" size={28} color={brandColors.primary} />
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

export default NextButton;
