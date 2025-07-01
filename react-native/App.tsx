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
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import AuthWrapper from './src/components/AuthWrapper';
import SignOutButton from './src/components/SignOutButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import FontAwesome6 from 'react-native-vector-icons/FontAwesome6';

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
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#0A0A0A' : '#FAFAFA',
  };

  const renderHomeScreen = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: isDarkMode ? '#0D9488' : '#14B8A6' }]}>
            <Text style={styles.logoText}>🧘</Text>
          </View>
          <Text style={[styles.appName, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
            Guras
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.profileButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.profileButtonText, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>👤</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Start Card */}
      <View style={styles.quickStartSection}>
        <View style={[styles.quickStartCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
          <Text style={[styles.quickStartTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
            Ready to meditate?
          </Text>
          <Text style={[styles.quickStartSubtitle, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
            Start your daily practice
          </Text>
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDarkMode ? '#0D9488' : '#14B8A6' }]}>
            <Text style={styles.buttonText}>Begin Session</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Daily Progress */}
      <View style={styles.progressSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
          Today's Progress
        </Text>
        <View style={[styles.progressCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>Minutes</Text>
            <Text style={[styles.progressValue, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>0</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>Sessions</Text>
            <Text style={[styles.progressValue, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>0</Text>
          </View>
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>Streak</Text>
            <Text style={[styles.progressValue, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>0 days</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
            <Text style={styles.quickActionIcon}>🧘‍♀️</Text>
            <Text style={[styles.quickActionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>Meditate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
            <Text style={styles.quickActionIcon}>🕯️</Text>
            <Text style={[styles.quickActionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>Mindfulness</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
            <Text style={styles.quickActionIcon}>🌙</Text>
            <Text style={[styles.quickActionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>Sleep</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.quickActionCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
            <Text style={styles.quickActionIcon}>📿</Text>
            <Text style={[styles.quickActionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>Wisdom</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recent Sessions */}
      <View style={styles.recentSection}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
          Recent Sessions
        </Text>
        <View style={[styles.recentCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
          <Text style={[styles.recentText, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
            No recent sessions
          </Text>
          <Text style={[styles.recentSubtext, { color: isDarkMode ? '#A0AEC0' : '#A0AEC0' }]}>
            Start your first meditation to see your history here
          </Text>
        </View>
      </View>
    </ScrollView>
  );

  const renderMeditateScreen = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
        Meditation Sessions
      </Text>
      <Text style={[styles.tabSubtitle, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
        Choose your practice
      </Text>
    </View>
  );

  const renderLearnScreen = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
        Learn & Grow
      </Text>
      <Text style={[styles.tabSubtitle, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
        Explore spiritual wisdom
      </Text>
    </View>
  );

  const renderProfileScreen = () => (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <View style={[styles.logo, { backgroundColor: isDarkMode ? '#0D9488' : '#14B8A6' }]}>
            <Text style={styles.logoText}>👤</Text>
          </View>
          <Text style={[styles.appName, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
            Profile
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.backButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.backButtonText, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>←</Text>
        </TouchableOpacity>
      </View>

      {/* User Info */}
      <View style={styles.profileSection}>
        <View style={[styles.profileCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
          <Text style={[styles.profileTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
            Account Information
          </Text>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileLabel, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>Email:</Text>
            <Text style={[styles.profileValue, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
              {user?.email}
            </Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileLabel, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>User ID:</Text>
            <Text style={[styles.profileValue, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
              {user?.uid}
            </Text>
          </View>
        </View>
      </View>

      {/* Sign Out Button */}
      <View style={styles.signOutSection}>
        <SignOutButton 
          style={styles.signOutButton}
          textStyle={styles.signOutButtonText}
        />
      </View>
    </ScrollView>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'home':
        return renderHomeScreen();
      case 'meditate':
        return renderMeditateScreen();
      case 'learn':
        return renderLearnScreen();
      case 'profile':
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
      
      {/* Beautiful gradient background */}
      <View style={styles.gradientBackground}>
        <View style={[
          styles.gradientLayer1, 
          { backgroundColor: isDarkMode ? '#1A1A2E' : '#F0F8FF' }
        ]} />
        <View style={[
          styles.gradientLayer2, 
          { backgroundColor: isDarkMode ? '#16213E' : '#E6F3FF' }
        ]} />
      </View>
      
      {/* Main Content */}
      <View style={styles.mainContent}>
        {renderActiveTab()}
      </View>

      {/* Bottom Navigation */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: isDarkMode ? '#1A1A2E' : '#FFFFFF',
            paddingBottom: insets.bottom || 16,
          },
        ]}
      >
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]} 
          onPress={() => setActiveTab('home')}
        >
          <Feather
            name="home"
            size={24}
            color={activeTab === 'home' ? '#14B8A6' : '#A0AEC0'}
          />
          <Text style={[styles.navLabel, activeTab === 'home' && styles.activeNavLabel]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'meditate' && styles.activeNavItem]} 
          onPress={() => setActiveTab('meditate')}
        >
          <Feather
            name="heart"
            size={24}
            color={activeTab === 'meditate' ? '#14B8A6' : '#A0AEC0'}
          />
          <Text style={[styles.navLabel, activeTab === 'meditate' && styles.activeNavLabel]}>Meditate</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'learn' && styles.activeNavItem]} 
          onPress={() => setActiveTab('learn')}
        >
          <FontAwesome
            name="book-open"
            size={24}
            solid
            color={activeTab === 'learn' ? '#14B8A6' : '#A0AEC0'}
          />
          <Text style={[styles.navLabel, activeTab === 'learn' && styles.activeNavLabel]}>Learn</Text>
        </TouchableOpacity>
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
    <SafeAreaProvider>
      <AuthProvider>
        <AuthWrapper navigation={mockNavigation}>
          <MainApp />
        </AuthWrapper>
      </AuthProvider>
    </SafeAreaProvider>
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
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  gradientLayer2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
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
    fontSize: 24,
    fontWeight: 'bold',
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickStartSubtitle: {
    fontSize: 16,
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    fontSize: 16,
  },
  progressValue: {
    fontSize: 18,
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
    fontSize: 14,
    fontWeight: '600',
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
    fontSize: 16,
    marginBottom: 8,
  },
  recentSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tabSubtitle: {
    fontSize: 16,
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
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  activeNavItem: {
    // Active state styling
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  activeNavIcon: {
    // Active icon styling
  },
  navLabel: {
    fontSize: 12,
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
