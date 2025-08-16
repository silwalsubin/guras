import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setSliderValue, setPendingSeek, setIsSliding } from '@/store/musicPlayerSlice';
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

const SLIDER_WIDTH = 320;
const SLIDER_HEIGHT = 40;
const THUMB_SIZE = 16; // Static size for the custom thumb
const TRACK_OFFSET = 8; // Offset to align thumb with slider track

const ProgressBar: React.FC = () => {
  const dispatch = useDispatch();
  const { isSetup, progress: contextProgress } = useMusicPlayer();
  
  const {
    progress: reduxProgress,
    sliderValue,
    pendingSeek,
    isSliding
  } = useSelector((state: RootState) => state.musicPlayer);
  
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
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
      reduxProgress: {
        position: reduxProgress.position,
        duration: reduxProgress.duration,
        buffered: reduxProgress.buffered
      },
      sliderValue,
      pendingSeek,
      isSliding
    });
  }, [contextProgress, reduxProgress, sliderValue, pendingSeek, isSliding]);

  // Update slider value when progress changes (but not when sliding)
  useEffect(() => {
    if (!isSliding && pendingSeek === null && contextProgress.duration > 0) {
      console.log('🎵 Updating slider value from context progress:', contextProgress.position);
      dispatch(setSliderValue(contextProgress.position));
    }
  }, [contextProgress.position, contextProgress.duration, isSliding, pendingSeek, dispatch]);

  // Calculate thumb position
  const effectiveWidth = SLIDER_WIDTH - 2 * TRACK_OFFSET;
  const currentValue = isSliding ? sliderValue : (pendingSeek !== null ? pendingSeek : contextProgress.position);
  const thumbPosition = TRACK_OFFSET + ((currentValue / (contextProgress.duration || 1)) * effectiveWidth);

  const handleSlidingStart = () => {
    console.log('🎵 Slider sliding started');
    dispatch(setIsSliding(true));
  };

  const handleSlidingComplete = async (value: number) => {
    try {
      console.log('🎵 Slider sliding completed, seeking to:', value);
      dispatch(setPendingSeek(value));
      
      if (isSetup && contextProgress.duration > 0) {
        await TrackPlayer.seekTo(value);
        console.log('✅ Seek completed');
      }
      
      dispatch(setIsSliding(false));
      dispatch(setPendingSeek(null));
    } catch (error) {
      console.error('❌ Seek failed:', error);
      dispatch(setIsSliding(false));
      dispatch(setPendingSeek(null));
    }
  };

  const handleValueChange = (value: number) => {
    console.log('🎵 Slider value changed:', value);
    dispatch(setSliderValue(value));
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
      <View style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT, position: 'relative', justifyContent: 'center' }}>
        <Slider
          style={{ width: SLIDER_WIDTH, height: SLIDER_HEIGHT, position: 'absolute', left: 0, top: 0 }}
          minimumValue={0}
          maximumValue={contextProgress.duration || 1}
          value={currentValue}
          minimumTrackTintColor={brandColors.primary}
          maximumTrackTintColor={themeColors.textSecondary}
          thumbTintColor="transparent" // Hide default thumb
          onSlidingStart={handleSlidingStart}
          onSlidingComplete={handleSlidingComplete}
          onValueChange={handleValueChange}
          disabled={!isSetup || contextProgress.duration === 0}
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
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    alignItems: 'center',
    width: '90%',
    marginBottom: 0, // More space from bottom
    marginTop: 20, // Add some space above progress bar
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 8,
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  customThumb: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: COLORS.PRIMARY,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    top: (SLIDER_HEIGHT - THUMB_SIZE) / 2,
    shadowColor: COLORS.SHADOW,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
});

export default ProgressBar;
