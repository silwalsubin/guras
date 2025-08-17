import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

const AudioScreen: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
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

      {/* Simple Content List */}
      <View style={styles.contentContainer}>
        <View style={styles.contentItem}>
          <FontAwesome name="users" size={16} color={brandColors.primary} />
          <Text style={[styles.contentText, { color: themeColors.textPrimary }]}>Browse Artists</Text>
        </View>

        <View style={styles.contentItem}>
          <FontAwesome name="music" size={16} color={brandColors.primary} />
          <Text style={[styles.contentText, { color: themeColors.textPrimary }]}>Browse Songs</Text>
        </View>

        <View style={styles.contentItem}>
          <FontAwesome name="compact-disc" size={16} color={brandColors.primary} />
          <Text style={[styles.contentText, { color: themeColors.textPrimary }]}>Browse Albums</Text>
        </View>

        <View style={styles.contentItem}>
          <Feather name="list" size={16} color={brandColors.primary} />
          <Text style={[styles.contentText, { color: themeColors.textPrimary }]}>Playlists</Text>
        </View>
      </View>

      {/* Coming Soon Notice */}
      <View style={styles.comingSoonContainer}>
        <Text style={[styles.comingSoonText, { color: themeColors.textSecondary }]}>
          Music browsing features coming soon
        </Text>
      </View>

      {/* Bottom padding to prevent content from being hidden by footer */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
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
  contentContainer: {
    gap: 12,
    marginBottom: 24,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  contentText: {
    fontSize: 16,
    fontWeight: '500',
  },
  comingSoonContainer: {
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default AudioScreen; 