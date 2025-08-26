import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getThemeColors } from '@/config/colors';
import { RootState } from '@/store';

const ProgressScreen: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          Progress
        </Text>
        <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
          All meditation progress has been moved to the Meditation tab
        </Text>
      </View>

      <View style={styles.redirectContainer}>
        <Text style={[styles.redirectText, { color: themeColors.textSecondary }]}>
          📊 Your meditation analytics, streaks, achievements, and detailed progress tracking are now available in the Meditation tab for a better experience.
        </Text>
        <Text style={[styles.redirectSubtext, { color: themeColors.textSecondary }]}>
          This tab can be repurposed for other types of progress tracking in the future.
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  redirectContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  redirectText: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  redirectSubtext: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
});

export default ProgressScreen;
