import React from 'react';
import { View, StyleSheet, ScrollView, Text } from 'react-native';
import MiniMusicPlayer from './MiniMusicPlayer';
import { getBrandColors } from '@/config/colors';

/**
 * This file shows different ways to use the MiniMusicPlayer component
 * You can copy these examples and use them in your screens
 */

// Example 1: Basic usage (what's already added to App.tsx)
export const GlobalMiniPlayer = () => {
  const handlePress = () => {
    // Navigate to full music player
    console.log('Navigate to music player');
  };

  return (
    <MiniMusicPlayer 
      onPress={handlePress}
      style={styles.globalPlayer}
    />
  );
};

// Example 2: Inline in a screen (e.g., at the top of a screen)
export const InlineTopMiniPlayer = () => {
  return (
    <View style={styles.screenContainer}>
      <MiniMusicPlayer 
        style={styles.topPlayer}
        showArtwork={true}
      />
      <ScrollView style={styles.content}>
        <Text>Your screen content here...</Text>
      </ScrollView>
    </View>
  );
};

// Example 3: Compact version without artwork
export const CompactMiniPlayer = () => {
  return (
    <MiniMusicPlayer 
      showArtwork={false}
      style={styles.compactPlayer}
    />
  );
};

// Example 4: Custom styled mini player
export const CustomStyledMiniPlayer = () => {
  const brandColors = getBrandColors();
  
  return (
    <MiniMusicPlayer 
      style={[styles.customPlayer, { backgroundColor: brandColors.primary }]}
      showArtwork={true}
    />
  );
};

// Example 5: Mini player in a card/modal
export const CardMiniPlayer = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Now Playing</Text>
      <MiniMusicPlayer 
        style={styles.cardPlayer}
        showArtwork={true}
      />
    </View>
  );
};

// Example 6: Usage in a specific screen component
export const ExampleScreen = () => {
  const handleMiniPlayerPress = () => {
    // Custom navigation logic
    console.log('Open full player from this screen');
  };

  return (
    <View style={styles.screenContainer}>
      {/* Your screen header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Screen</Text>
      </View>

      {/* Main content */}
      <ScrollView style={styles.content}>
        <Text>Screen content...</Text>
        
        {/* You can also embed it within content */}
        <View style={styles.contentSection}>
          <Text style={styles.sectionTitle}>Currently Playing</Text>
          <MiniMusicPlayer 
            onPress={handleMiniPlayerPress}
            style={styles.embeddedPlayer}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  // Global player (positioned absolutely)
  globalPlayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 80, // Above bottom navigation
    zIndex: 1000,
  },

  // Screen container
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  // Top positioned player
  topPlayer: {
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    borderTopWidth: 0,
  },

  // Compact player
  compactPlayer: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },

  // Custom styled player
  customPlayer: {
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },

  // Card container
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },

  cardPlayer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    paddingHorizontal: 0,
  },

  // Screen layout
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },

  content: {
    flex: 1,
    padding: 16,
  },

  contentSection: {
    marginVertical: 16,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },

  embeddedPlayer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderTopWidth: 0,
  },
});

export default {
  GlobalMiniPlayer,
  InlineTopMiniPlayer,
  CompactMiniPlayer,
  CustomStyledMiniPlayer,
  CardMiniPlayer,
  ExampleScreen,
};
