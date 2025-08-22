import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import Slider from '@react-native-community/slider';
import TrackPlayer from 'react-native-track-player';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { COLORS } from '@/config/colors';

// Helper function to format time in MM:SS format
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const SLIDER_HEIGHT = 40;
const THUMB_SIZE = 16; // Static size for the custom thumb
const TRACK_OFFSET = 8; // Offset to align thumb with slider track

const ProgressBar: React.FC = () => {
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { isSetup, progress: contextProgress } = useMusicPlayer();

  // Local state for slider management (no Redux needed)
  const [sliderValue, setSliderValue] = useState(0);
  const [pendingSeek, setPendingSeek] = useState<number | null>(null);
  const [isSliding, setIsSliding] = useState(false);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const shadowColor = COLORS.SHADOW;

  // Debug progress values
  useEffect(() => {
    console.log('🔍 ProgressBar Debug:', {
      contextProgress: {
        position: contextProgress.position,
        duration: contextProgress.duration,
        buffered: contextProgress.buffered
      },
      sliderValue,
      pendingSeek,
      isSliding
    });
  }, [contextProgress, sliderValue, pendingSeek, isSliding]);

  // Update slider value when progress changes (but not when sliding)
  useEffect(() => {
    if (!isSliding && pendingSeek === null && contextProgress.duration > 0) {
      console.log('🎵 Updating slider value from context progress:', contextProgress.position);
      setSliderValue(contextProgress.position);
    }
  }, [contextProgress.position, contextProgress.duration, isSliding, pendingSeek]);

  // Calculate current value for slider
  const currentValue = isSliding ? sliderValue : (pendingSeek !== null ? pendingSeek : contextProgress.position);

  const handleSlidingStart = () => {
    console.log('🎵 Slider sliding started');
    setIsSliding(true);
  };

  const handleSlidingComplete = async (value: number) => {
    try {
      console.log('🎵 Slider sliding completed, seeking to:', value);
      setPendingSeek(value);

      if (isSetup && contextProgress.duration > 0) {
        await TrackPlayer.seekTo(value);
        console.log('✅ Seek completed');
      }

      setIsSliding(false);
      setPendingSeek(null);
    } catch (error) {
      console.error('❌ Seek failed:', error);
      setIsSliding(false);
      setPendingSeek(null);
    }
  };

  const handleValueChange = (value: number) => {
    console.log('🎵 Slider value changed:', value);
    setSliderValue(value);
  };

  return (
    <View style={styles.progressContainer}>
      <View style={styles.timeRow}>
        <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
          {formatTime(contextProgress.position)}
        </Text>
        <Text style={[styles.timeText, { color: themeColors.textSecondary }]}>
          {formatTime(contextProgress.duration)}
        </Text>
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={contextProgress.duration || 1}
          value={currentValue}
          minimumTrackTintColor={brandColors.primary}
          maximumTrackTintColor={isDarkMode ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.2)'}
          thumbTintColor={brandColors.primary}
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          onValueChange={handleValueChange}
          disabled={!isSetup || contextProgress.duration === 0}
        />
        {/* Floating time label above thumb while sliding */}
        {isSliding && (
          <View style={styles.timeTooltip}>
            <View style={[styles.timeTooltipContent, { backgroundColor: themeColors.card }]}>
              <Text style={[styles.timeTooltipText, { color: themeColors.textPrimary }]}>
                {formatTime(sliderValue)}
              </Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 0,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  sliderContainer: {
    width: '100%',
    height: SLIDER_HEIGHT,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slider: {
    width: '100%',
    height: SLIDER_HEIGHT,
  },
  timeTooltip: {
    position: 'absolute',
    top: -40,
    alignItems: 'center',
    zIndex: 20,
  },
  timeTooltipContent: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  timeTooltipText: {
    fontWeight: '600',
    fontSize: 12,
    textAlign: 'center',
  },
});

export default ProgressBar;
