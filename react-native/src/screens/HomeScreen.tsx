import React, { useState, useCallback } from 'react';
import {
  ScrollView,
  StyleSheet,
  View,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { RefreshUtils } from '@/utils/refreshUtils';
import { COLORS } from '@/config/colors';
import {
  AppHeader,
  DailyQuoteCard,
} from '@/components/shared';

const HomeScreen: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      console.log('🔄 Refreshing home screen data...');
      
      const result = await RefreshUtils.refreshHomeScreen();
      
      if (result.success) {
        console.log('✅ Home screen refreshed successfully');
      } else {
        console.warn('⚠️ Some items failed to refresh:', result.errors);
      }
      
    } catch (error) {
      console.error('Error refreshing home screen:', error);
    } finally {
      setRefreshing(false);
    }
  }, []);

  return (
    <ScrollView 
      style={styles.scrollView} 
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={isDarkMode ? COLORS.WHITE : COLORS.BLACK}
          colors={[COLORS.PRIMARY]}
        />
      }
    >
      {/* Header */}
      <AppHeader 
        onProfilePress={() => console.log('Profile pressed')} 
      />

      {/* Daily Wisdom */}
      <View style={styles.quoteSection}>
        <DailyQuoteCard />
      </View>

      {/* Future home content can be added here */}
      {/* Example: Welcome message, daily inspiration, featured content */}

      {/* Bottom padding to prevent content from being hidden by footer */}
      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  quoteSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  bottomPadding: {
    height: 100, // Account for bottom navigation + safe area
  },
});

export default HomeScreen;
