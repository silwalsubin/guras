/**
 * Guras React Native App
 * Beautiful Rhododendron-themed aesthetic home page
 *
 * @format
 */

import React from 'react';
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

  const backgroundStyle = {
    backgroundColor: isDarkMode ? '#0A0A0A' : '#FAFAFA',
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Beautiful gradient background using multiple layers */}
      <View style={styles.gradientBackground}>
        <View style={[
          styles.gradientLayer1, 
          { backgroundColor: isDarkMode ? '#1A1A2E' : '#FFE5E5' }
        ]} />
        <View style={[
          styles.gradientLayer2, 
          { backgroundColor: isDarkMode ? '#16213E' : '#FFF0F0' }
        ]} />
        <View style={[
          styles.gradientLayer3, 
          { backgroundColor: isDarkMode ? '#0F3460' : '#F8F9FF' }
        ]} />
      </View>
      
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={[styles.logo, { backgroundColor: isDarkMode ? '#FF6B9D' : '#FF8FA3' }]}>
              <Text style={styles.logoText}>🌺</Text>
            </View>
            <Text style={[styles.appName, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
              Guras :)
            </Text>
          </View>
          <Text style={[styles.tagline, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
            Where beauty blooms
          </Text>
        </View>

        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={[styles.heroCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
            <Text style={[styles.heroTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
              Welcome to Guras
            </Text>
            <Text style={[styles.heroSubtitle, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
              Discover the beauty of Rhododendron flowers and create your own digital garden
            </Text>
            <TouchableOpacity style={[styles.primaryButton, { backgroundColor: isDarkMode ? '#FF6B9D' : '#FF8FA3' }]}>
              <Text style={styles.buttonText}>Start Exploring</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
            What's New
          </Text>
          
          <View style={styles.featuresGrid}>
            <TouchableOpacity style={[styles.featureCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
              <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#FF6B9D' : '#FF8FA3' }]}>
                <Text style={styles.featureIconText}>🌸</Text>
              </View>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
                Flower Gallery
              </Text>
              <Text style={[styles.featureDescription, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
                Browse beautiful Rhododendron varieties
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
              <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#FF6B9D' : '#FF8FA3' }]}>
                <Text style={styles.featureIconText}>📱</Text>
              </View>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
                Smart Features
              </Text>
              <Text style={[styles.featureDescription, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
                Modern UI with smooth animations
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
              <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#FF6B9D' : '#FF8FA3' }]}>
                <Text style={styles.featureIconText}>🎨</Text>
              </View>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
                Custom Themes
              </Text>
              <Text style={[styles.featureDescription, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
                Personalize your experience
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.featureCard, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
              <View style={[styles.featureIcon, { backgroundColor: isDarkMode ? '#FF6B9D' : '#FF8FA3' }]}>
                <Text style={styles.featureIconText}>🌿</Text>
              </View>
              <Text style={[styles.featureTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
                Garden Care
              </Text>
              <Text style={[styles.featureDescription, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
                Tips for growing Rhododendrons
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActionsSection}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
            Quick Actions
          </Text>
          
          <View style={styles.quickActionsRow}>
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
              <Text style={[styles.quickActionText, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
                🌺 Gallery
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.quickActionButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.8)' }]}>
              <Text style={[styles.quickActionText, { color: isDarkMode ? '#FFFFFF' : '#2D3748' }]}>
                📖 Guide
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: isDarkMode ? '#CBD5E0' : '#718096' }]}>
            Made with ❤️ and 🌺
          </Text>
          <Text style={[styles.footerSubtext, { color: isDarkMode ? '#A0AEC0' : '#A0AEC0' }]}>
            Version 2.0.1
          </Text>
        </View>
      </ScrollView>
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
    height: height * 0.4,
    opacity: 0.8,
  },
  gradientLayer2: {
    position: 'absolute',
    top: height * 0.2,
    left: 0,
    right: 0,
    height: height * 0.6,
    opacity: 0.6,
  },
  gradientLayer3: {
    position: 'absolute',
    top: height * 0.4,
    left: 0,
    right: 0,
    height: height * 0.6,
    opacity: 0.4,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  logoText: {
    fontSize: 24,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 4,
  },
  heroSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  heroCard: {
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  primaryButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconText: {
    fontSize: 24,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginHorizontal: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    marginBottom: 8,
  },
  footerSubtext: {
    fontSize: 14,
  },
});

export default App;
