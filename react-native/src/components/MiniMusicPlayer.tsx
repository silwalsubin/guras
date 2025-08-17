import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import MiniPlayPauseButton from './mini-music-controls/MiniPlayPauseButton';
import MiniNextButton from './mini-music-controls/MiniNextButton';
import MiniPreviousButton from './mini-music-controls/MiniPreviousButton';

interface MiniMusicPlayerProps {
  onPress?: () => void; // Optional callback when the player is tapped
  showArtwork?: boolean; // Whether to show album artwork
  style?: any; // Custom styling
}

const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  onPress,
  showArtwork = true,
  style
}) => {
  const { currentTrack, audioFiles, isFullPlayerVisible } = useSelector((state: RootState) => state.musicPlayer);
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { activeTab } = useSelector((state: RootState) => state.navigation);
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  // Don't render if no track is loaded, full player is visible, or not on Audio tab
  if (!currentTrack || audioFiles.length === 0 || isFullPlayerVisible || activeTab !== 'audio') {
    return null;
  }

  const handlePlayerPress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: themeColors.card,
        borderTopColor: themeColors.border,
      },
      style
    ]}>
      <TouchableOpacity
        style={styles.trackInfo}
        onPress={handlePlayerPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {/* Album Artwork */}
        {showArtwork && (
          <View style={styles.artworkContainer}>
            {currentTrack.artworkUrl ? (
              <Image
                source={{ uri: currentTrack.artworkUrl }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[
                styles.artwork,
                styles.placeholderArtwork,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0' }
              ]}>
                <FontAwesome
                  name="music"
                  size={16}
                  color={brandColors.primary}
                />
              </View>
            )}
          </View>
        )}

        {/* Track Information */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={[styles.artist, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Expand Indicator */}
        {onPress && (
          <View style={styles.expandIndicator}>
            <FontAwesome
              name="chevron-up"
              size={12}
              color={themeColors.textSecondary}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Mini Controls */}
      <View style={styles.controlsContainer}>
        <MiniPreviousButton />
        <MiniPlayPauseButton />
        <MiniNextButton />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8, // Restore some padding for better touch targets
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    minHeight: 60,
    marginBottom: -8, // Negative margin to pull closer to footer
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40, // Ensure text container has enough space
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 6, // Slightly more rounded
  },
  placeholderArtwork: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8, // Add padding to prevent text from touching controls
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3, // Slightly more space between title and artist
    lineHeight: 18, // Ensure proper line height
  },
  artist: {
    fontSize: 12,
    lineHeight: 16, // Ensure proper line height
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8, // Reduced to give more space to text
  },
  expandIndicator: {
    marginLeft: 8,
    marginRight: 4,
    opacity: 0.6,
  },
});

export default MiniMusicPlayer;
