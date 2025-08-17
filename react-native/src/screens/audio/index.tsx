import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import * as musicPlayerActions from '@/store/musicPlayerSlice';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { apiService, AudioFile } from '@/services/api';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';

const AudioScreen: React.FC = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { audioFiles: reduxAudioFiles } = useSelector((state: RootState) => state.musicPlayer);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const { playTrack, currentTrack, isPlaying } = useMusicPlayer();

  // State
  const [audioFiles, setAudioFiles] = useState<AudioFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showMyFiles, setShowMyFiles] = useState(true);

  // Load audio files
  const loadAudioFiles = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = showMyFiles
        ? await apiService.getMyAudioFiles()
        : await apiService.getAudioFiles();

      if (response.data) {
        setAudioFiles(response.data.files);
        // Also update Redux state for music controls
        dispatch(musicPlayerActions.setAudioFiles(response.data.files));
      } else {
        Alert.alert('Error', response.error || 'Failed to load audio files');
      }
    } catch (error) {
      console.error('Error loading audio files:', error);
      Alert.alert('Error', 'Failed to load audio files');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load files on mount and when view changes
  useEffect(() => {
    loadAudioFiles();
  }, [showMyFiles]);

  // Update Redux whenever local audioFiles state changes
  useEffect(() => {
    dispatch(musicPlayerActions.setAudioFiles(audioFiles));
  }, [audioFiles, dispatch]);

  // Handle track selection
  const handleTrackPress = (audioFile: AudioFile, index: number) => {
    const track = {
      id: audioFile.id,
      title: audioFile.name,
      artist: audioFile.author,
      url: audioFile.audioDownloadUrl,
      artwork: audioFile.thumbnailDownloadUrl || undefined,
      duration: audioFile.durationSeconds || 0,
    };

    // Update Redux state with current track index
    dispatch(musicPlayerActions.setCurrentTrackIndex(index));

    playTrack(track);
  };

  // Handle refresh
  const onRefresh = () => {
    loadAudioFiles(true);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Music Library
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          Discover and explore your music
        </Text>
      </View>

      {/* View Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            showMyFiles && { backgroundColor: brandColors.primary },
            { borderColor: brandColors.primary }
          ]}
          onPress={() => setShowMyFiles(true)}
        >
          <Text style={[
            styles.toggleText,
            { color: showMyFiles ? '#fff' : brandColors.primary }
          ]}>
            My Files
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            !showMyFiles && { backgroundColor: brandColors.primary },
            { borderColor: brandColors.primary }
          ]}
          onPress={() => setShowMyFiles(false)}
        >
          <Text style={[
            styles.toggleText,
            { color: !showMyFiles ? '#fff' : brandColors.primary }
          ]}>
            All Files
          </Text>
        </TouchableOpacity>
      </View>

      {/* Audio Files List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Loading audio files...
          </Text>
        </View>
      ) : audioFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="music" size={48} color={themeColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
            No Audio Files
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            {showMyFiles ? 'You haven\'t uploaded any audio files yet' : 'No audio files available'}
          </Text>
        </View>
      ) : (
        <View style={styles.audioList}>
          {audioFiles.map((audioFile, index) => (
            <TouchableOpacity
              key={audioFile.id}
              style={[
                styles.audioItem,
                {
                  backgroundColor: themeColors.surface,
                  borderColor: currentTrack?.id === audioFile.id ? brandColors.primary : themeColors.border
                }
              ]}
              onPress={() => handleTrackPress(audioFile, index)}
            >
              {/* Thumbnail */}
              <View style={styles.thumbnailContainer}>
                {audioFile.thumbnailDownloadUrl ? (
                  <Image
                    source={{ uri: audioFile.thumbnailDownloadUrl }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.thumbnailPlaceholder, { backgroundColor: brandColors.primary }]}>
                    <FontAwesome name="music" size={24} color="#fff" />
                  </View>
                )}

                {/* Play indicator */}
                {currentTrack?.id === audioFile.id && (
                  <View style={styles.playIndicator}>
                    <FontAwesome
                      name={isPlaying ? "pause" : "play"}
                      size={16}
                      color="#fff"
                    />
                  </View>
                )}
              </View>

              {/* Track Info */}
              <View style={styles.trackInfo}>
                <Text
                  style={[styles.trackTitle, { color: themeColors.textPrimary }]}
                  numberOfLines={1}
                >
                  {audioFile.name}
                </Text>
                <Text
                  style={[styles.trackArtist, { color: themeColors.textSecondary }]}
                  numberOfLines={1}
                >
                  {audioFile.author}
                </Text>
                {audioFile.description && (
                  <Text
                    style={[styles.trackDescription, { color: themeColors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {audioFile.description}
                  </Text>
                )}
              </View>

              {/* Duration */}
              {audioFile.durationSeconds && (
                <Text style={[styles.duration, { color: themeColors.textSecondary }]}>
                  {formatDuration(audioFile.durationSeconds)}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Bottom padding to prevent content from being hidden by footer */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

// Helper function to format duration
const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 2,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    borderWidth: 1,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  audioList: {
    gap: 12,
  },
  audioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 16,
  },
  thumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  trackDescription: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },

  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default AudioScreen; 