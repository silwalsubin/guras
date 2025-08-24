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
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';
import { apiService, AudioFile } from '@/services/api';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { useDownload } from '@/contexts/DownloadContext';
import { DownloadButton } from '@/components/shared';

const AudioScreen: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const {
    playTrack,
    playLocalTrack,
    currentTrack,
    isPlaying,
    audioFiles: contextAudioFiles,
    setAudioFiles: setContextAudioFiles,
    setCurrentTrackIndex,
    loading: contextLoading,
    setLoading: setContextLoading
  } = useMusicPlayer();

  const { getLocalFile } = useDownload();

  // State
  const [refreshing, setRefreshing] = useState(false);

  // Load audio files - always load all files
  const loadAudioFiles = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setContextLoading(true);
      }

      const response = await apiService.getAudioFiles();

      if (response.data) {
        setContextAudioFiles(response.data.files);
      } else {
        Alert.alert('Error', response.error || 'Failed to load audio files');
      }
    } catch (error) {
      console.error('Error loading audio files:', error);
      Alert.alert('Error', 'Failed to load audio files');
    } finally {
      setContextLoading(false);
      setRefreshing(false);
    }
  };

  // Load files on mount
  useEffect(() => {
    loadAudioFiles();
  }, []);

  // No longer needed - context manages audioFiles directly

  // Handle track selection
  const handleTrackPress = (audioFile: AudioFile, index: number) => {
    // Check if we have a local version of this file
    const localFile = getLocalFile(audioFile);

    if (localFile && localFile.isDownloaded) {
      // Play local file for better performance and offline support
      setCurrentTrackIndex(index);
      playLocalTrack(localFile);
    } else {
      // Play remote file
      const track = {
        id: audioFile.id,
        title: audioFile.name,
        artist: audioFile.author,
        url: audioFile.audioDownloadUrl,
        artwork: audioFile.thumbnailDownloadUrl || undefined,
        duration: audioFile.durationSeconds || 0,
      };

      setCurrentTrackIndex(index);
      playTrack(track);
    }
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

      {/* Audio Files List */}
      {contextLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
            Loading audio files...
          </Text>
        </View>
      ) : contextAudioFiles.length === 0 ? (
        <View style={styles.emptyContainer}>
          <FontAwesome name="music" size={48} color={themeColors.textSecondary} />
          <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
            No Audio Files
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
            No audio files available
          </Text>
        </View>
      ) : (
        <View style={styles.audioList}>
          {contextAudioFiles.map((audioFile, index) => (
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
                    <FontAwesome name="music" size={12} color="#fff" />
                  </View>
                )}

                {/* Play indicator */}
                {currentTrack?.id === audioFile.id && (
                  <View style={styles.playIndicator}>
                    <FontAwesome
                      name={isPlaying ? "pause" : "play"}
                      size={10}
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
              </View>

              {/* Duration */}
              {audioFile.durationSeconds && (
                <Text style={[styles.duration, { color: themeColors.textSecondary }]}>
                  {formatDuration(audioFile.durationSeconds)}
                </Text>
              )}

              {/* Download Button */}
              <DownloadButton
                audioFile={audioFile}
                size="small"
                onDownloadComplete={() => {
                  // Optionally show success message
                }}
                onDownloadError={(error) => {
                  Alert.alert('Download Failed', error.message);
                }}
              />
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
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
  },
  thumbnailContainer: {
    position: 'relative',
    marginRight: 12,
  },
  thumbnail: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  thumbnailPlaceholder: {
    width: 30,
    height: 30,
    borderRadius: 6,
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
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfo: {
    flex: 1,
    marginRight: 12,
  },
  trackTitle: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  trackArtist: {
    fontSize: 13,
    marginBottom: 0,
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