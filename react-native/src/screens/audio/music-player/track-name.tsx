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
          
          {/* Track Position */}
          <Text style={[styles.trackPosition, { color: themeColors.textSecondary }]}>
            {trackInfo.position}
          </Text>
        </>
      ) : (
        // Invisible placeholders to maintain exact layout during loading
        <>
          <View style={[styles.titlePlaceholder, { marginBottom: 8 }]} />
          <View style={[styles.positionPlaceholder, { marginBottom: 12 }]} />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  titleContainer: {
    alignItems: 'center',
    paddingHorizontal: 16,
    width: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  trackPosition: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    opacity: 0.7,
    letterSpacing: 0.3,
  },
  titlePlaceholder: {
    width: 240,
    height: 32, // Match title fontSize (24) + line height
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    borderRadius: 8,
  },
  positionPlaceholder: {
    width: 80,
    height: 20, // Match trackPosition fontSize (16) + some padding
    backgroundColor: 'rgba(128, 128, 128, 0.15)',
    borderRadius: 6,
  },
});

export default TrackName;
