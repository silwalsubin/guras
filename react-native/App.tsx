/**
 * Guras React Native App
 * Meditation and Spirituality App
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  TouchableOpacity,
  Dimensions,
  Image,
  Vibration,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthWrapper from './src/components/AuthWrapper';
import ProfileScreen from './src/components/ProfileScreen';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import FontLoader from './src/components/FontLoader';
import { TYPOGRAPHY } from './src/config/fonts';
import { getThemeColors, getBrandColors, COLORS } from './src/config/colors';
import FooterMenuItem from './src/components/FooterMenuItem';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store, { RootState } from './src/store';
import { setActiveTab, TAB_KEYS, TabKey } from './src/store/navigationSlice';
import MusicPlayer from './src/components/MusicPlayer';
import { MusicPlayerProvider } from './src/contexts/MusicPlayerContext';

// Verify Firebase is imported correctly
console.log('Firebase App Name:', getApp().name); // should print "[DEFAULT]"

const { width, height } = Dimensions.get('window');

// Mock navigation object for the auth screens
const mockNavigation = {
  navigate: (screen: string) => {
    // This will be handled by the auth wrapper
    console.log('Navigate to:', screen);
  },
};

function MainApp(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const backgroundStyle = {
    backgroundColor: themeColors.background,
  };

  const activeTab = useSelector((state: RootState) => state.navigation.activeTab);
  const dispatch = useDispatch();

  const renderHomeScreen = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: brandColors.primary }]}>
            <Text style={styles.logoText}>🧘</Text>
          </View>
          <Text style={[styles.appName, { color: themeColors.textPrimary }]}>
            Guras
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: themeColors.border }]}
          onPress={() => dispatch(setActiveTab(TAB_KEYS.PROFILE))}
        >
          <Text style={[styles.profileButtonText, { color: themeColors.textPrimary }]}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Start Card */}
      <View style={styles.quickStartSection}>
        <View style={[styles.quickStartCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.quickStartTitle, { color: themeColors.textPrimary }]}>
            Ready to meditate?
          </Text>
          <Text style={[styles.quickStartSubtitle, { color: themeColors.textSecondary }]}>
            Start your daily practice
          </Text>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: brandColors.primary }]}>
            <Text style={[styles.buttonText, { color: COLORS.WHITE }]}>Begin Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Progress */}
      <View style={styles.progressSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Today's Progress
        </Text>
        <View style={[styles.progressCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Minutes</Text>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>0</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Sessions</Text>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>0</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: themeColors.textSecondary }]}>Streak</Text>
            <Text style={[styles.progressValue, { color: themeColors.textPrimary }]}>0 days</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: themeColors.card }]}>
            <Text style={styles.quickActionIcon}>🧘‍♀️</Text>
            <Text style={[styles.quickActionTitle, { color: themeColors.textPrimary }]}>Meditate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: themeColors.card }]}>
            <Text style={styles.quickActionIcon}>🕯️</Text>
            <Text style={[styles.quickActionTitle, { color: themeColors.textPrimary }]}>Mindfulness</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: themeColors.card }]}>
            <Text style={styles.quickActionIcon}>🌙</Text>
            <Text style={[styles.quickActionTitle, { color: themeColors.textPrimary }]}>Sleep</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: themeColors.card }]}>
            <Text style={styles.quickActionIcon}>📿</Text>
            <Text style={[styles.quickActionTitle, { color: themeColors.textPrimary }]}>Wisdom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.recentSection}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Recent Sessions
        </Text>
        <View style={[styles.recentCard, { backgroundColor: themeColors.card }]}>
          <Text style={[styles.recentText, { color: themeColors.textSecondary }]}>
            No recent sessions
          </Text>
          <Text style={[styles.recentSubtext, { color: themeColors.textSecondary }]}>
            Start your first meditation to see your history here
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderMeditateScreen = () => (
    <View style={styles.tabContent}>
      <MusicPlayer />
    </View>
  );

  const renderLearnScreen = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: themeColors.textPrimary }]}>
        Learn & Grow
      </Text>
      <Text style={[styles.tabSubtitle, { color: themeColors.textSecondary }]}>
        Explore spiritual wisdom
      </Text>
    </View>
  );

  const renderProfileScreen = () => (
    <ProfileScreen onBack={() => dispatch(setActiveTab(TAB_KEYS.HOME))} />
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case TAB_KEYS.HOME:
        return renderHomeScreen();
      case TAB_KEYS.MEDITATE:
        return renderMeditateScreen();
      case TAB_KEYS.LEARN:
        return renderLearnScreen();
      case TAB_KEYS.PROFILE:
        return renderProfileScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Beautiful blended gradient background */}
      <View style={[
        styles.gradientBackground,
        {
          backgroundColor: themeColors.background,
        }
      ]}>
        <View style={[
          styles.gradientOverlay,
          {
            backgroundColor: themeColors.overlay,
          }
        ]} />
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        <MusicPlayerProvider>
          {renderActiveTab()}
        </MusicPlayerProvider>
      </View>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: themeColors.card,
            borderTopColor: themeColors.border,
            paddingBottom: insets.bottom || 16,
          },
        ]}
      >
        <FooterMenuItem
          tabKey={TAB_KEYS.HOME}
          iconName="home"
          iconType="feather"
        />
        <FooterMenuItem
          tabKey={TAB_KEYS.MEDITATE}
          iconName="heart"
          iconType="feather"
        />
        <FooterMenuItem
          tabKey={TAB_KEYS.LEARN}
          iconName="book-open"
          iconType="fontawesome"
          solid
        />
      </View>
    </SafeAreaView>
  );
}

function App(): React.JSX.Element {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '393821350316-v39tafbkk5cf6p5visoqaqrd5foe6vmk.apps.googleusercontent.com', // TODO: Replace with your actual Web client ID
    });
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <FontLoader>
          <AuthProvider>
            <AuthWrapper navigation={mockNavigation}>
              <MainApp />
            </AuthWrapper>
          </AuthProvider>
        </FontLoader>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainContent: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logoText: {
    fontSize: 20,
  },
  appName: {
    ...TYPOGRAPHY.H4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 20,
  },
  quickStartSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickStartCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStartTitle: {
    ...TYPOGRAPHY.H4,
    marginBottom: 8,
  },
  quickStartSubtitle: {
    ...TYPOGRAPHY.BODY,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF', // This will be updated dynamically
    ...TYPOGRAPHY.BUTTON,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    ...TYPOGRAPHY.H5,
    marginBottom: 16,
  },
  progressCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressLabel: {
    ...TYPOGRAPHY.BODY,
  },
  progressValue: {
    ...TYPOGRAPHY.BODY_LARGE,
    fontWeight: 'bold',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  recentCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  recentText: {
    ...TYPOGRAPHY.BODY,
    marginBottom: 8,
  },
  recentSubtext: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabTitle: {
    ...TYPOGRAPHY.H4,
    marginBottom: 8,
  },
  tabSubtitle: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)', // This will be updated dynamically
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    // Active icon styling
  },
  navLabel: {
    ...TYPOGRAPHY.CAPTION,
    color: '#718096',
  },
  activeNavLabel: {
    color: '#14B8A6',
    fontWeight: '600',
  },
  profileSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  profileCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  profileTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileLabel: {
    fontSize: 16,
  },
  profileValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  signOutSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  signOutButton: {
    borderRadius: 12,
    paddingVertical: 16,
  },
  signOutButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default App;
