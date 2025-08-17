import React from 'react';
import { TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setCurrentTrack, setCurrentTrackIndex } from '@/store/musicPlayerSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors } from '@/config/colors';
import TrackPlayer, { State } from 'react-native-track-player';
import { apiService, AudioFile } from '@/services/api';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const PreviousButton: React.FC = () => {
  const dispatch = useDispatch();
  const { audioFiles, currentTrackIndex } = useSelector((state: RootState) => state.musicPlayer);
  const { playTrack } = useMusicPlayer();
  const brandColors = getBrandColors();



  const handlePreviousTrack = async () => {
    try {
      if (audioFiles.length <= 1) {
        Alert.alert('No Previous Track', 'This is the first track.');
        return;
      }

      // Calculate previous track index
      const prevIndex = currentTrackIndex === 0 ? audioFiles.length - 1 : currentTrackIndex - 1;
      const prevAudioFile = audioFiles[prevIndex];

      console.log('🎵 Navigating to previous track:', prevIndex, prevAudioFile.name);

      // Convert to TrackInfo format for context
      const track = {
        id: prevAudioFile.id,
        title: prevAudioFile.name,
        artist: prevAudioFile.author,
        url: prevAudioFile.audioDownloadUrl,
        artwork: prevAudioFile.thumbnailDownloadUrl || undefined,
        duration: prevAudioFile.durationSeconds || 0,
      };

      // Update Redux state
      dispatch(setCurrentTrackIndex(prevIndex));

      // Use context to play track (this will update UI properly)
      await playTrack(track);

      console.log('🎵 Previous track loaded:', track.title);
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
