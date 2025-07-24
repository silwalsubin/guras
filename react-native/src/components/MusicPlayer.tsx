import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Slider from '@react-native-community/slider';
import { COLORS, getThemeColors, getBrandColors } from '@/config/colors';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
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

const SLIDER_WIDTH = 320;
const SLIDER_HEIGHT = 40;
const THUMB_SIZE = 16; // Static size for the custom thumb
const TRACK_OFFSET = 8; // Offset to align thumb with slider track

const MusicPlayer: React.FC = () => {
  const { isSetup, isPlaying, togglePlayback, progress } = useMusicPlayer();
  const [sliderValue, setSliderValue] = useState(0);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);

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
    slider: {
      width: SLIDER_WIDTH,
      height: SLIDER_HEIGHT,
      marginTop: 8,
      marginBottom: 8,
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
    customThumb: {
      position: 'absolute',
      zIndex: 10,
      backgroundColor: brandColors.primary,
      width: THUMB_SIZE,
      height: THUMB_SIZE,
      borderRadius: THUMB_SIZE / 2,
      top: (SLIDER_HEIGHT - THUMB_SIZE) / 2,
      shadowColor: shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 4,
    },
  });

  // After seeking, keep showing pendingSeek until player catches up
  useEffect(() => {
    if (
      pendingSeek !== null &&
      Math.abs(progress.position - pendingSeek) < 0.5 // threshold in seconds
    ) {
      setPendingSeek(null);
    }
  }, [progress.position, pendingSeek]);

  // Update slider value from progress only when not sliding and not pending seek
  useEffect(() => {
    if (progress.duration > 0 && !isSliding && pendingSeek === null) {
      setSliderValue(progress.position);
    }
  }, [progress.position, progress.duration, isSliding, pendingSeek]);

  const effectiveWidth = SLIDER_WIDTH - 2 * TRACK_OFFSET;
  const thumbPosition = TRACK_OFFSET + ((pendingSeek !== null ? pendingSeek : isSliding ? sliderValue : sliderValue) / (progress.duration || 1)) * effectiveWidth;

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
            {formatTime(progress.duration)}
          </Text>
        </View>
        <View style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT, position: 'relative', justifyContent: 'center' }}>
          <Slider
            style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT, position: 'absolute', left: 0, top: 0 }}
            minimumValue={0}
            maximumValue={progress.duration}
            value={isSliding ? sliderValue : (pendingSeek !== null ? pendingSeek : sliderValue)}
            minimumTrackTintColor={brandColors.primary}
            maximumTrackTintColor={themeColors.textSecondary}
            thumbTintColor="transparent" // Hide default thumb
            onSlidingStart={() => setIsSliding(true)}
            onSlidingComplete={async (value) => {
              setPendingSeek(value);
              if (isSetup && progress.duration > 0) {
                await TrackPlayer.seekTo(value);
              }
              setIsSliding(false);
            }}
            onValueChange={(value) => setSliderValue(value)}
            disabled={!isSetup || progress.duration === 0}
          />
          {/* Static custom thumb overlay */}
          <View
            pointerEvents="none"
            style={[
              styles.customThumb,
              {
                left: Math.max(
                  TRACK_OFFSET,
                  Math.min(
                    SLIDER_WIDTH - THUMB_SIZE - TRACK_OFFSET,
                    thumbPosition - (THUMB_SIZE / 2)
                  )
                ),
              },
            ]}
          />
          {/* Floating time label above thumb while sliding */}
          {isSliding && (
            <View
              style={{
                position: 'absolute',
                left: Math.max(
                  TRACK_OFFSET,
                  Math.min(
                    SLIDER_WIDTH - THUMB_SIZE - TRACK_OFFSET,
                    thumbPosition - (THUMB_SIZE / 2)
                  )
                ),
                top: -32, // 32px above the slider
                width: 72,
                alignItems: 'center',
                zIndex: 20,
              }}
            >
              <View
                style={{
                  backgroundColor: themeColors.card,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                  shadowColor: shadowColor,
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.1,
                  shadowRadius: 4,
                  elevation: 2,
                }}
              >
                <Text
                  style={{ color: themeColors.textPrimary, fontWeight: '600', fontSize: 12, textAlign: 'center' }}
                  numberOfLines={1}
                  ellipsizeMode="clip"
                >
                  {formatTime(sliderValue)}
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

export default MusicPlayer; 