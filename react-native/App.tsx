/**
 * Guras React Native App
 * Meditation and Spirituality App
 *
 * @format
 */

import React, { useState } from 'react';
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

const { width, height } = Dimensions.get('window');

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  const [activeTab, setActiveTab] = useState('home');

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
        <TouchableOpacity style={[styles.profileButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
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
    <View style={styles.tabContent}>
      <Text style={[styles.tabTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
        Your Profile
      </Text>
      <Text style={[styles.tabSubtitle, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
        Track your journey
      </Text>
    </View>
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

      {/* Bottom Tab Navigation */}
      <View style={[styles.bottomTab, { backgroundColor: isDarkMode ? 'rgba(26,26,46,0.95)' : 'rgba(255,255,255,0.95)' }]}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('home')}
        >
          <Text style={[styles.tabIcon, { color: activeTab === 'home' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            🏠
          </Text>
          <Text style={[styles.tabLabel, { color: activeTab === 'home' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            Home
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('meditate')}
        >
          <Text style={[styles.tabIcon, { color: activeTab === 'meditate' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            🧘‍♀️
          </Text>
          <Text style={[styles.tabLabel, { color: activeTab === 'meditate' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            Meditate
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('learn')}
        >
          <Text style={[styles.tabIcon, { color: activeTab === 'learn' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            📚
          </Text>
          <Text style={[styles.tabLabel, { color: activeTab === 'learn' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            Learn
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('profile')}
        >
          <Text style={[styles.tabIcon, { color: activeTab === 'profile' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            👤
          </Text>
          <Text style={[styles.tabLabel, { color: activeTab === 'profile' ? (isDarkMode ? '#0D9488' : '#14B8A6') : (isDarkMode ? '#CBD5E0' : '#718096') }]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  gradientLayer1: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.3,
    opacity: 0.8,
  },
  gradientLayer2: {
    position: 'absolute',
    top: height * 0.2,
    left: 0,
    right: 0,
    height: height * 0.8,
    opacity: 0.6,
  },
  mainContent: {
    flex: 1,
    paddingBottom: 80, // Space for bottom tab
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
    paddingBottom: 20,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoText: {
    fontSize: 20,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileButtonText: {
    fontSize: 18,
  },
  quickStartSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickStartCard: {
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickStartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  quickStartSubtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  primaryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  progressCard: {
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  progressLabel: {
    fontSize: 14,
  },
  progressValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    width: (width - 60) / 2,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  recentCard: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
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
  bottomTab: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 4,
  },
  tabIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  tabTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  tabSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
