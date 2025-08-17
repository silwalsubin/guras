import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors } from '@/config/colors';

const TrackName: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const { loading, currentTrack, currentTrackIndex, audioFiles } = useSelector((state: RootState) => state.musicPlayer);
  const themeColors = getThemeColors(isDarkMode);

  // Get current track info for display
  const getCurrentTrackInfo = () => {
    if (loading) {
      return { title: '', position: '' };
    }
    if (!currentTrack || audioFiles.length === 0) {
      return { title: 'No tracks available', position: '0 / 0' };
    }
    return {
      title: currentTrack.title,
      position: `${currentTrackIndex + 1} / ${audioFiles.length}`
    };
  };

  const trackInfo = getCurrentTrackInfo();

  return (
    <View style={styles.titleContainer}>
      {!loading && trackInfo.title ? (
        <>
          <Text style={[styles.title, { color: themeColors.textPrimary }]}>
            {trackInfo.title}
          </Text>

          {/* Artist Name */}
          {currentTrack?.artist && (
            <Text style={[styles.artist, { color: themeColors.textSecondary }]}>
              {currentTrack.artist}
            </Text>
          )}

          {/* Track Position */}
          <Text style={[styles.trackPosition, { color: themeColors.textSecondary }]}>
            {trackInfo.position}
          </Text>
        </>
      ) : (
        // Invisible placeholders to maintain exact layout during loading
        <>
          <View style={[styles.titlePlaceholder, { marginBottom: 8 }]} />
          <View style={[styles.artistPlaceholder, { marginBottom: 6 }]} />
          <View style={[styles.positionPlaceholder, { marginBottom: 12 }]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    width: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
    lineHeight: 36,
    letterSpacing: 0.5,
  },
  artist: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 8,
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  trackPosition: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.6,
    letterSpacing: 0.3,
  },
  titlePlaceholder: {
    width: 260,
    height: 36, // Match title fontSize (28) + line height
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 8,
  },
  artistPlaceholder: {
    width: 180,
    height: 24, // Match artist fontSize (18) + some padding
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    borderRadius: 6,
  },
  positionPlaceholder: {
    width: 60,
    height: 18, // Match trackPosition fontSize (14) + some padding
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: 4,
  },
});

export default TrackName;
