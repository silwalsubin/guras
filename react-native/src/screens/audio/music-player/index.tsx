import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, FlatList, Alert, ImageBackground, Image } from 'react-native';
import TrackPlayer, { State, Event } from 'react-native-track-player';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { COLORS, getThemeColors, getBrandColors } from '@/config/colors';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { apiService, AudioFile } from '@/services/api';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { 
  setAudioFiles, 
  setCurrentTrackIndex, 
  setCurrentTrack, 
  setLoading,
  setProgress,
  nextTrack
} from '@/store/musicPlayerSlice';
import TrackName from './track-name';
import PreviousButton from './music-controls/previous-button';
import PlayPauseButton from './music-controls/play-pause-button';
import NextButton from './music-controls/next-button';
import ProgressBar from './progress-bar';



const MusicPlayer: React.FC = () => {
  const { isSetup, togglePlayback } = useMusicPlayer();
  const dispatch = useDispatch();
  
  // Get all music player state from Redux
  const {
    isPlaying,
    progress,
    audioFiles,
    currentTrackIndex,
    currentTrack,
    loading
  } = useSelector((state: RootState) => state.musicPlayer);
  
  // Get the actual theme state from Redux
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const shadowColor = COLORS.SHADOW;
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: themeColors.background,
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.3,
    },
    contentContainer: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 120, // Account for footer height
      justifyContent: 'space-between',
    },

    // Artwork Section
    artworkSection: {
      alignItems: 'center',
      marginBottom: 32,
    },
    artworkContainer: {
      shadowColor: COLORS.SHADOW,
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 12,
    },
    albumArtwork: {
      width: 280,
      height: 280,
      borderRadius: 20,
      backgroundColor: themeColors.card,
    },
    artworkFallback: {
      width: 280,
      height: 280,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.GRAY_100,
    },

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

    loveButtonContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: 16,
      marginBottom: 16,
    },
    // Track Info Section
    trackInfoSection: {
      alignItems: 'center',
      marginBottom: 24,
    },
    additionalControlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
      gap: 24,
    },
    iconButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
    },

    // Player Controls Section
    playerControlsSection: {
      alignItems: 'center',
    },
    progressSection: {
      width: '100%',
      marginBottom: 32,
      paddingHorizontal: 8, // Add some padding to ensure proper alignment
    },
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 32,
      gap: 40,
    },

    // Bottom Controls
    bottomControlsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
      paddingHorizontal: 16,
    },
    volumeButton: {
      padding: 8,
    },
    volumeSliderContainer: {
      flex: 1,
      marginHorizontal: 16,
    },
    volumeSlider: {
      height: 4,
      borderRadius: 2,
      overflow: 'hidden',
    },
    volumeFill: {
      height: '100%',
      borderRadius: 2,
    },

    // Action Buttons
    actionButtonsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 32,
    },
    actionButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)',
    },

  });



  // Note: Audio files are now loaded by MusicService component globally
  // This component just displays the player UI and uses the shared Redux state

  // Track loading and auto-advance are now handled by MusicService component



  // Sync progress with Redux state
  useEffect(() => {
    console.log('🎵 Progress update:', { position: progress.position, duration: progress.duration, buffered: progress.buffered });
    
    if (progress.duration > 0) {
      dispatch(setProgress({
        position: progress.position,
        duration: progress.duration,
        buffered: progress.buffered || 0
      }));
    }
  }, [progress.position, progress.duration, progress.buffered, dispatch]);

  // Update progress when track is loaded
  useEffect(() => {
    if (currentTrack && progress.duration === 0) {
      // When a track is loaded but progress is still 0, try to get track info
      const getTrackInfo = async () => {
        try {
          const queue = await TrackPlayer.getQueue();
          if (queue.length > 0) {
            const track = queue[0];
            // Set initial progress state
            dispatch(setProgress({
              position: 0,
              duration: track.duration || 0,
              buffered: 0
            }));
            console.log('🎵 Initial progress set for track:', track.title);
          }
        } catch (error) {
          console.log('⚠️ Could not get initial track info:', error);
        }
      };
      getTrackInfo();
    }
  }, [currentTrack, progress.duration, dispatch]);

  // Periodic progress update for smoother slider updates
  useEffect(() => {
    if (!isPlaying || progress.duration === 0) return;

    const interval = setInterval(() => {
      // Force a progress update to ensure slider stays in sync
      if (progress.position > 0) {
        dispatch(setProgress({
          position: progress.position,
          duration: progress.duration,
          buffered: progress.buffered || 0
        }));
      }
    }, 100); // Update every 100ms for smooth progress

    return () => clearInterval(interval);
  }, [isPlaying, progress.duration, progress.position, progress.buffered, dispatch]);



  

  const bgSource = currentTrack?.artworkUrl ? { uri: currentTrack.artworkUrl } : undefined;

  return (
    <View style={styles.container}>
      {bgSource && (
        <ImageBackground source={bgSource} blurRadius={20} style={styles.background} />
      )}

      {/* Main Content Container */}
      <View style={styles.contentContainer}>

        {/* Album Artwork Section */}
        <View style={styles.artworkSection}>
          <View style={styles.artworkContainer}>
            {currentTrack?.artworkUrl ? (
              <Image
                source={{ uri: currentTrack.artworkUrl }}
                style={styles.albumArtwork}
                resizeMode="cover"
              />
            ) : (
              <View style={[
                styles.artworkFallback,
                {
                  backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                  borderWidth: 1,
                  borderColor: isDarkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'
                }
              ]}>
                <FontAwesome
                  name="music"
                  size={64}
                  color={brandColors.primary}
                />
              </View>
            )}
          </View>
        </View>

        {/* Track Information */}
        <View style={styles.trackInfoSection}>
          <TrackName />

          {/* Additional Controls Row */}
          <View style={styles.additionalControlsRow}>
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <FontAwesome name="random" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <FontAwesome name="repeat" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]}>
              <FontAwesome name="infinity" size={18} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Playback Controls - Only show when there are audio files */}
        {audioFiles.length > 0 && (
          <View style={styles.playerControlsSection}>
            {/* Progress Bar */}
            <View style={styles.progressSection}>
              <ProgressBar />
            </View>

            {/* Main Controls */}
            <View style={styles.controlsContainer}>
              <PreviousButton />
              <PlayPauseButton />
              <NextButton />
            </View>

            {/* Volume and Additional Controls */}
            <View style={styles.bottomControlsRow}>
              <TouchableOpacity style={styles.volumeButton}>
                <FontAwesome name="volume-down" size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.volumeSliderContainer}>
                <View style={[styles.volumeSlider, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)' }]}>
                  <View style={[styles.volumeFill, { backgroundColor: brandColors.primary, width: '60%' }]} />
                </View>
              </View>

              <TouchableOpacity style={styles.volumeButton}>
                <FontAwesome name="volume-up" size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Bottom Action Buttons */}
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="quote-left" size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="share-alt" size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="list" size={16} color={themeColors.textSecondary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

export default MusicPlayer; 