import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS, getThemeColors, getBrandColors } from '../config/colors';
import { useMusicPlayer } from '../contexts/MusicPlayerContext';
import meditationBuddha from '../../assets/meditation_buddha.mp3';

// Helper function to format time in MM:SS format
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const TRACK = {
  id: 'meditation_buddha',
  url: meditationBuddha,
  title: 'Om Mane Padme Hum',
  artist: 'Guras',
};

const MusicPlayer: React.FC = () => {
  const { isSetup, isPlaying, togglePlayback, progress } = useMusicPlayer();
  const [hoverPosition, setHoverPosition] = useState<number | null>(null); // Track hover position
  const [sliderPosition, setSliderPosition] = useState(0); // Track slider position
  const [isUserInteracting, setIsUserInteracting] = useState(false); // Track if user is interacting
  
  const themeColors = getThemeColors(false); // Assuming light mode
  const brandColors = getBrandColors();
  const shadowColor = COLORS.SHADOW;
  const styles = StyleSheet.create({
    container: {
      alignItems: 'center',
      marginTop: 32,
      marginBottom: 100, // Account for footer height
      flex: 1,
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      marginBottom: 12,
    },
    spacer: {
      flex: 1.5,
    },
    progressContainer: {
      alignItems: 'center',
      width: '90%',
      marginBottom: 40, // More space from bottom
    },
    timeRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 8,
    },
    timeText: {
      fontSize: 10,
      minWidth: 35,
      textAlign: 'center',
    },
    progressBarBackground: {
      width: 320,
      height: 8,
      borderRadius: 4,
      backgroundColor: COLORS.GRAY_200,
      overflow: 'hidden',
      shadowColor: shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    progressBarFill: {
      height: 8,
      borderRadius: 4, // match background for rounded ends
      // No position: 'absolute' or other overlay styles
    },
    progressBarTouchable: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    },
    sliderHandle: {
      position: 'absolute',
      top: -4,
      width: 16,
      height: 16,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: themeColors.card,
      shadowColor: shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
      zIndex: 1000,
    },
    playPauseButton: {
      marginTop: 8,
      padding: 12,
      borderRadius: 24,
      shadowColor: shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
    progressBarWrapper: {
      width: '100%',
      position: 'relative',
    },
    timeTooltip: {
      position: 'absolute',
      top: -30,
      left: '50%',
      transform: [{ translateX: -20 }],
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      shadowColor: shadowColor,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      backgroundColor: themeColors.card,
    },
    timeTooltipText: {
      fontSize: 10,
      fontWeight: '600',
      color: themeColors.textPrimary,
    },
  });

  // Calculate progress percentage safely
  const progressPercentage = progress.duration > 0 ? (progress.position / progress.duration) : 0;

  // Show a small progress even when track hasn't loaded
  const displayProgress = progress.duration > 0 ? progressPercentage * 100 : 0; // Use actual progress percentage

  // Update slider position when track progresses naturally (only when not user interacting)
  useEffect(() => {
    if (progress.duration > 0 && !isUserInteracting) {
      setSliderPosition(progressPercentage * 100);
    }
  }, [progress.position, progress.duration, isUserInteracting]);

    return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>{TRACK.title}</Text>
      <View style={styles.spacer} />
      <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayback}>
        <FontAwesome name={isPlaying ? 'pause' : 'play'} size={32} color={brandColors.primary} />
      </TouchableOpacity>
      <View style={styles.progressContainer}>
        <View style={styles.timeRow}>
          <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
            {formatTime(progress.position)}
          </Text>
          <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
            {formatTime(Math.max(0, progress.duration - progress.position))}
          </Text>
        </View>
        <View style={styles.progressBarWrapper}>
          <View style={styles.progressBarBackground}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: brandColors.primary,
                  width: (displayProgress / 100) * 320, // Use actual progress for fill
                }
              ]} 
            />
          </View>
          <View 
            style={[
              styles.sliderHandle, 
              { 
                left: Math.max(0, Math.min(304, (sliderPosition / 100) * 320)) - 8, // Center the handle properly
                backgroundColor: brandColors.primary,
              }
            ]} 
          />
          <TouchableOpacity 
            style={styles.progressBarTouchable}
            onPress={(event) => {
              const { locationX } = event.nativeEvent;
              const estimatedWidth = 320;
              const progressPercentage = Math.max(0, Math.min(1, locationX / estimatedWidth));
              const newPosition = progressPercentage * progress.duration;
              if (isSetup && progress.duration > 0) {
                TrackPlayer.seekTo(newPosition);
              }
              setSliderPosition(progressPercentage * 100); // Use exact percentage for slider position
              setHoverPosition(null);
              setIsUserInteracting(false); // Stop user interaction
            }}
            onPressIn={(event) => {
              const { locationX } = event.nativeEvent;
              const estimatedWidth = 320;
              const progressPercentage = Math.max(0, Math.min(1, locationX / estimatedWidth));
              setHoverPosition(progressPercentage * progress.duration);
              setSliderPosition(progressPercentage * 100); // Use exact percentage for slider position
              setIsUserInteracting(true); // Start user interaction
            }}
            onPressOut={() => {
              setHoverPosition(null);
              setIsUserInteracting(false); // Stop user interaction
            }}
          />
          {hoverPosition !== null && (
            <View style={[styles.timeTooltip, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.timeTooltipText, { color: themeColors.textPrimary }]}>
                {formatTime(hoverPosition)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default MusicPlayer; 