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
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  trackPosition: {
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'center',
  },
  titlePlaceholder: {
    width: 200,
    height: 22, // Match title fontSize (18) + some padding
  },
  positionPlaceholder: {
    width: 100,
    height: 18, // Match trackPosition fontSize (14) + some padding
  },
});

export default TrackName;
