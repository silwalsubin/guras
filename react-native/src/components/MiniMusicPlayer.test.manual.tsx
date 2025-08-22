/**
 * Manual test component for MiniMusicPlayer with audio visualization
 * This can be used to manually test the audio visualization behavior
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import MiniMusicPlayer from './MiniMusicPlayer';
import navigationReducer from '../store/navigationSlice';
// musicPlayerSlice removed - using MusicPlayerContext instead
import themeReducer from '../store/themeSlice';

// Create a test store with controllable state
const createTestStore = (isPlaying: boolean = false) => {
  return configureStore({
    reducer: {
      navigation: navigationReducer,
      musicPlayer: musicPlayerReducer,
      theme: themeReducer,
    },
    preloadedState: {
      navigation: {
        activeTab: 'audio',
      },
      musicPlayer: {
        currentTrack: {
          id: 'test-track',
          title: 'Test Song for Audio Visualization',
          artist: 'Test Artist',
          url: 'https://example.com/test.mp3',
          artworkUrl: null,
        },
        audioFiles: [
          { 
            id: 'test-track', 
            title: 'Test Song for Audio Visualization',
            fileName: 'test.mp3',
            downloadUrl: 'https://example.com/test.mp3',
            artist: 'Test Artist'
          }
        ],
        isFullPlayerVisible: false,
        isPlaying: isPlaying,
        currentTrackIndex: 0,
        progress: { position: isPlaying ? 30 : 0, duration: 180, buffered: 60 },
        loading: false,
      },
      theme: {
        isDarkMode: false,
      },
    },
  });
};

const MiniMusicPlayerTestComponent: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [store, setStore] = useState(() => createTestStore(false));

  const togglePlayback = () => {
    const newIsPlaying = !isPlaying;
    setIsPlaying(newIsPlaying);
    setStore(createTestStore(newIsPlaying));
  };

  const showInstructions = () => {
    Alert.alert(
      'Audio Visualization Test',
      'Instructions:\n\n' +
      '1. Tap "Toggle Playback" to start/stop music\n' +
      '2. When playing, you should see:\n' +
      '   • Animated bars next to the album artwork\n' +
      '   • Progress line at the bottom spanning full width\n' +
      '3. Put the app in background - animations should stop but audio should continue\n' +
      '4. Return to foreground - animations should resume if music is still playing\n' +
      '5. Pause music - animations and progress should stop immediately\n\n' +
      'This tests both the audio visualization and progress indicator features.',
      [{ text: 'Got it!' }]
    );
  };

  return (
    <Provider store={store}>
      <View style={styles.container}>
        <Text style={styles.title}>Mini Music Player Test</Text>
        <Text style={styles.subtitle}>Audio Visualization & Background Audio Test</Text>
        
        <View style={styles.controls}>
          <TouchableOpacity style={styles.button} onPress={togglePlayback}>
            <Text style={styles.buttonText}>
              {isPlaying ? 'Pause Music' : 'Play Music'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.button} onPress={showInstructions}>
            <Text style={styles.buttonText}>Show Instructions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.playerContainer}>
          <Text style={styles.status}>
            Status: {isPlaying ? 'Playing (animations should be visible)' : 'Paused (no animations)'}
          </Text>
          <MiniMusicPlayer />
        </View>

        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Test Notes:</Text>
          <Text style={styles.notesText}>
            • Audio visualization appears only when music is playing{'\n'}
            • Progress line spans full width at bottom of player{'\n'}
            • Real-time progress updates from TrackPlayer{'\n'}
            • Animations stop when app goes to background{'\n'}
            • Background audio should continue playing{'\n'}
            • Animations resume when returning to foreground
          </Text>
        </View>
      </View>
    </Provider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
  playerContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  notes: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
});

export default MiniMusicPlayerTestComponent;
