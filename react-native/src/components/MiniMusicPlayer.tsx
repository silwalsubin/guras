import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated, AppState } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getBrandColors, getThemeColors } from '@/config/colors';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import MiniPlayPauseButton from './mini-music-controls/MiniPlayPauseButton';
import MiniNextButton from './mini-music-controls/MiniNextButton';
import MiniPreviousButton from './mini-music-controls/MiniPreviousButton';

interface MiniMusicPlayerProps {
  onPress?: () => void; // Optional callback when the player is tapped
  showArtwork?: boolean; // Whether to show album artwork
  style?: any; // Custom styling
}

// Audio Visualization Component
const AudioVisualization: React.FC<{ isPlaying: boolean; isDarkMode: boolean }> = ({ isPlaying }) => {
  const brandColors = getBrandColors();

  // Create animated values for each bar
  const bar1 = useRef(new Animated.Value(0.3)).current;
  const bar2 = useRef(new Animated.Value(0.5)).current;
  const bar3 = useRef(new Animated.Value(0.7)).current;
  const bar4 = useRef(new Animated.Value(0.4)).current;
  const bar5 = useRef(new Animated.Value(0.6)).current;

  // Track app state to pause animations when app goes to background
  const appState = useRef(AppState.currentState);
  const [appStateVisible, setAppStateVisible] = React.useState(appState.current);

  // Keep track of running animations so we can stop them
  const animationsRef = useRef<Animated.CompositeAnimation[]>([]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', nextAppState => {
      appState.current = nextAppState;
      setAppStateVisible(nextAppState);
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  useEffect(() => {
    // Stop any existing animations first
    animationsRef.current.forEach(animation => animation.stop());
    animationsRef.current = [];

    // Only animate if music is playing AND app is in foreground
    if (isPlaying && appStateVisible === 'active') {
      // Create staggered animations for each bar
      const createBarAnimation = (animatedValue: Animated.Value) => {
        return Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: Math.random() * 0.8 + 0.2, // Random height between 0.2 and 1
              duration: 300 + Math.random() * 200, // Random duration between 300-500ms
              useNativeDriver: false,
            }),
            Animated.timing(animatedValue, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: false,
            }),
          ])
        );
      };

      // Start animations with different delays for natural effect and track them
      const animations = [
        createBarAnimation(bar1),
        createBarAnimation(bar2),
        createBarAnimation(bar3),
        createBarAnimation(bar4),
        createBarAnimation(bar5),
      ];

      animationsRef.current = animations;

      setTimeout(() => animations[0].start(), 0);
      setTimeout(() => animations[1].start(), 100);
      setTimeout(() => animations[2].start(), 200);
      setTimeout(() => animations[3].start(), 300);
      setTimeout(() => animations[4].start(), 400);
    } else {
      // Stop animations and reset to default heights
      bar1.setValue(0.3);
      bar2.setValue(0.5);
      bar3.setValue(0.7);
      bar4.setValue(0.4);
      bar5.setValue(0.6);
    }

    // Cleanup function to stop animations when component unmounts
    return () => {
      animationsRef.current.forEach(animation => animation.stop());
      animationsRef.current = [];
    };
  }, [isPlaying, appStateVisible, bar1, bar2, bar3, bar4, bar5]);

  const barColor = brandColors.primary;
  const maxHeight = 16;

  return (
    <View style={styles.audioVisualization}>
      <Animated.View
        style={[
          styles.audioBar,
          {
            backgroundColor: barColor,
            height: bar1.interpolate({
              inputRange: [0, 1],
              outputRange: [2, maxHeight],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.audioBar,
          {
            backgroundColor: barColor,
            height: bar2.interpolate({
              inputRange: [0, 1],
              outputRange: [2, maxHeight],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.audioBar,
          {
            backgroundColor: barColor,
            height: bar3.interpolate({
              inputRange: [0, 1],
              outputRange: [2, maxHeight],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.audioBar,
          {
            backgroundColor: barColor,
            height: bar4.interpolate({
              inputRange: [0, 1],
              outputRange: [2, maxHeight],
            }),
          },
        ]}
      />
      <Animated.View
        style={[
          styles.audioBar,
          {
            backgroundColor: barColor,
            height: bar5.interpolate({
              inputRange: [0, 1],
              outputRange: [2, maxHeight],
            }),
          },
        ]}
      />
    </View>
  );
};

const MiniMusicPlayer: React.FC<MiniMusicPlayerProps> = ({
  onPress,
  showArtwork = true,
  style
}) => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { activeTab } = useSelector((state: RootState) => state.navigation);
  const { currentTrack, isPlaying, progress, togglePlayback } = useMusicPlayer();
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  // Debug progress updates
  useEffect(() => {
    if (progress.duration > 0) {
      console.log('🎵 Mini Player Progress:', {
        position: progress.position,
        duration: progress.duration,
        percentage: (progress.position / progress.duration) * 100
      });
    }
  }, [progress.position, progress.duration]);

  // Don't render if no track is loaded or not on Audio tab
  if (!currentTrack || activeTab !== 'audio') {
    return null;
  }

  const handlePlayerPress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: themeColors.card,
        borderTopColor: themeColors.border,
      },
      style
    ]}>
      <TouchableOpacity
        style={styles.trackInfo}
        onPress={handlePlayerPress}
        activeOpacity={onPress ? 0.7 : 1}
      >
        {/* Album Artwork */}
        {showArtwork && (
          <View style={styles.artworkContainer}>
            {currentTrack.artwork ? (
              <Image
                source={{ uri: currentTrack.artwork }}
                style={styles.artwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[
                styles.artwork,
                styles.placeholderArtwork,
                { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0' }
              ]}>
                <FontAwesome
                  name="music"
                  size={16}
                  color={brandColors.primary}
                />
              </View>
            )}
          </View>
        )}

        {/* Audio Visualization - Show when music is playing */}
        {isPlaying && (
          <View style={styles.visualizationContainer}>
            <AudioVisualization isPlaying={isPlaying} isDarkMode={isDarkMode} />
          </View>
        )}

        {/* Track Information */}
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={[styles.artist, { color: themeColors.textSecondary }]} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </View>

        {/* Expand Indicator */}
        {onPress && (
          <View style={styles.expandIndicator}>
            <FontAwesome
              name="chevron-up"
              size={12}
              color={themeColors.textSecondary}
            />
          </View>
        )}
      </TouchableOpacity>

      {/* Mini Controls */}
      <View style={styles.controlsContainer}>
        <MiniPreviousButton />
        <MiniPlayPauseButton />
        <MiniNextButton />
      </View>

      {/* Progress Bar - Full width at bottom of mini player */}
      <View style={styles.progressContainer}>
        <View style={[
          styles.progressBackground,
          { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
        ]}>
          <View style={[
            styles.progressFill,
            {
              backgroundColor: brandColors.primary,
              width: progress.duration > 0 ? `${Math.min(100, Math.max(0, (progress.position / progress.duration) * 100))}%` : '0%'
            }
          ]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative', // Enable absolute positioning for progress bar
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 11, // Extra padding to account for progress bar height (8 + 3)
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
    minHeight: 60,
    marginBottom: -8, // Negative margin to pull closer to footer
  },
  trackInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 40, // Ensure text container has enough space
  },
  artworkContainer: {
    marginRight: 12,
  },
  artwork: {
    width: 40,
    height: 40,
    borderRadius: 6, // Slightly more rounded
  },
  placeholderArtwork: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8, // Add padding to prevent text from touching controls
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 3, // Slightly more space between title and artist
    lineHeight: 18, // Ensure proper line height
  },
  artist: {
    fontSize: 12,
    lineHeight: 16, // Ensure proper line height
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8, // Reduced to give more space to text
  },
  expandIndicator: {
    marginLeft: 8,
    marginRight: 4,
    opacity: 0.6,
  },
  visualizationContainer: {
    marginLeft: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  audioVisualization: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 20,
    width: 30,
  },
  audioBar: {
    width: 3,
    backgroundColor: '#007AFF',
    marginHorizontal: 1,
    borderRadius: 1.5,
    minHeight: 2,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3, // Slightly taller for better visibility
  },
  progressBackground: {
    height: '100%',
    backgroundColor: 'transparent', // Background will be set inline
  },
  progressFill: {
    height: '100%',
  },
});

export default MiniMusicPlayer;
