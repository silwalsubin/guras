import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useDownload } from '@/contexts/DownloadContext';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { DownloadButton } from '@/components/shared';

const DownloadsScreen: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const {
    downloadedFiles,
    refreshDownloads,
    getTotalDownloadedSize,
    clearAllDownloads,
  } = useDownload();

  const {
    playLocalTrack,
    currentTrack,
    isPlaying,
  } = useMusicPlayer();

  const [refreshing, setRefreshing] = useState(false);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadTotalSize();
  }, [downloadedFiles]);

  const loadTotalSize = async () => {
    try {
      const size = await getTotalDownloadedSize();
      setTotalSize(size);
    } catch (error) {
      console.error('Failed to get total size:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDownloads();
      await loadTotalSize();
    } catch (error) {
      console.error('Failed to refresh downloads:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleTrackPress = (localFile: any) => {
    try {
      playLocalTrack(localFile);
    } catch (error) {
      Alert.alert('Playback Error', 'Failed to play downloaded file');
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Downloads',
      'Are you sure you want to delete all downloaded files? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAllDownloads();
              setTotalSize(0);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear downloads');
            }
          },
        },
      ]
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            Downloaded Music
          </Text>
          <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
            {downloadedFiles.length} files • {formatFileSize(totalSize)}
          </Text>
        </View>

        {/* Clear All Button */}
        {downloadedFiles.length > 0 && (
          <TouchableOpacity
            style={[styles.clearAllButton, { borderColor: '#ff6b6b' }]}
            onPress={handleClearAll}
          >
            <FontAwesome name="trash" size={16} color="#ff6b6b" />
            <Text style={[styles.clearAllText, { color: '#ff6b6b' }]}>
              Clear All Downloads
            </Text>
          </TouchableOpacity>
        )}

        {/* Downloaded Files List */}
        {downloadedFiles.length === 0 ? (
          <View style={styles.emptyContainer}>
            <FontAwesome name="download" size={48} color={themeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
              No Downloaded Files
            </Text>
            <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
              Download music from the Audio tab to listen offline
            </Text>
          </View>
        ) : (
          <View style={styles.filesList}>
            {downloadedFiles.map((file) => (
              <TouchableOpacity
                key={file.id}
                style={[
                  styles.fileItem,
                  {
                    backgroundColor: themeColors.cardBackground,
                    borderColor: currentTrack?.id === file.id ? brandColors.primary : 'transparent',
                  },
                ]}
                onPress={() => handleTrackPress(file)}
              >
                {/* Thumbnail */}
                <View style={styles.thumbnailContainer}>
                  {file.localThumbnailPath || file.thumbnailDownloadUrl ? (
                    <Image
                      source={{ uri: file.localThumbnailPath || file.thumbnailDownloadUrl }}
                      style={styles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.thumbnailPlaceholder, { backgroundColor: brandColors.primary }]}>
                      <FontAwesome name="music" size={16} color="#fff" />
                    </View>
                  )}

                  {/* Play indicator */}
                  {currentTrack?.id === file.id && (
                    <View style={styles.playIndicator}>
                      <FontAwesome
                        name={isPlaying ? "pause" : "play"}
                        size={12}
                        color="#fff"
                      />
                    </View>
                  )}

                  {/* Downloaded indicator */}
                  <View style={styles.downloadedIndicator}>
                    <FontAwesome name="check-circle" size={12} color="#51cf66" />
                  </View>
                </View>

                {/* File Info */}
                <View style={styles.fileInfo}>
                  <Text
                    style={[styles.fileName, { color: themeColors.textPrimary }]}
                    numberOfLines={1}
                  >
                    {file.name}
                  </Text>
                  <Text
                    style={[styles.fileArtist, { color: themeColors.textSecondary }]}
                    numberOfLines={1}
                  >
                    {file.author}
                  </Text>
                  {file.downloadedAt && (
                    <Text style={[styles.downloadDate, { color: themeColors.textSecondary }]}>
                      Downloaded {new Date(file.downloadedAt).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                {/* Duration and Actions */}
                <View style={styles.fileActions}>
                  {file.durationSeconds && (
                    <Text style={[styles.duration, { color: themeColors.textSecondary }]}>
                      {formatDuration(file.durationSeconds)}
                    </Text>
                  )}
                  <DownloadButton
                    audioFile={file}
                    size="small"
                    onDownloadError={(error) => {
                      Alert.alert('Error', error.message);
                    }}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Bottom padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
  },
  clearAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    gap: 8,
  },
  clearAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
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
  filesList: {
    gap: 12,
  },
  fileItem: {
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
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 50,
    height: 50,
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
  downloadedIndicator: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: 'white',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fileInfo: {
    flex: 1,
    marginRight: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  fileArtist: {
    fontSize: 14,
    marginBottom: 2,
  },
  downloadDate: {
    fontSize: 12,
  },
  fileActions: {
    alignItems: 'flex-end',
    gap: 8,
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  bottomPadding: {
    height: 100,
  },
});

export default DownloadsScreen;
