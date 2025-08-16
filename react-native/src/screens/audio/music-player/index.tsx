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
      alignItems: 'center',
      marginTop: 32,
      marginBottom: 100, // Account for footer height
      flex: 1,
      justifyContent: 'space-between', // Distribute content evenly
    },
    background: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.25,
    },
    artworkFallback: {
      width: 200,
      height: 200,
      borderRadius: 16,
      overflow: 'hidden',
      marginTop: 24,
      backgroundColor: COLORS.GRAY_100,
      alignItems: 'center',
      justifyContent: 'center',
    },
    artworkContainer: {
      position: 'relative',
      alignItems: 'center',
      marginTop: 24,
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
    controlsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: 200,
      marginVertical: 20,
    },

  });



  // Load audio files from API
  const loadAudioFiles = async () => {
    console.log('🎵 Starting to load audio files...');
    dispatch(setLoading(true));
    try {
      const response = await apiService.getAudioFiles();
      console.log('🎵 API response received:', response.data ? `${response.data.files.length} files` : 'No data');
      
      if (response.data) {
        dispatch(setAudioFiles(response.data.files));
        console.log('🎵 Audio files dispatched to Redux:', response.data.files.length);
        
        // Only auto-load first track if TrackPlayer has no tracks loaded
        if (response.data.files.length > 0 && !currentTrack) {
          console.log('🎵 Attempting to load first track...');
          try {
            const queue = await TrackPlayer.getQueue();
            const playerState = await TrackPlayer.getState();
            
            console.log('🎵 Current TrackPlayer state:', { queueLength: queue.length, playerState });
            
            // Only load track if no tracks in queue and not playing
            if (queue.length === 0 && playerState !== State.Playing && playerState !== State.Paused) {
              console.log('🎵 Loading first track (no queue, not playing)...');
              await loadTrack(response.data.files[0], 0);
            } else if (queue.length > 0) {
              console.log('🎵 Syncing with existing TrackPlayer state...');
              // If TrackPlayer has tracks, sync component state with current track
              const currentTrackIndex = await TrackPlayer.getCurrentTrack();
              if (currentTrackIndex !== null && currentTrackIndex >= 0) {
                const currentTrackInfo = await TrackPlayer.getTrack(currentTrackIndex);
                if (currentTrackInfo) {
                  const trackIndex = response.data.files.findIndex(file => file.fileName === currentTrackInfo.id);
                  if (trackIndex !== -1) {
                    const apiItem = response.data.files[trackIndex];
                    dispatch(setCurrentTrack({
                      id: currentTrackInfo.id || '',
                      url: currentTrackInfo.url || '',
                      title: currentTrackInfo.title || apiItem?.title || '',
                      artist: currentTrackInfo.artist || apiItem?.artist || '',
                      artworkUrl: (apiItem?.artworkUrl ?? undefined),
                    }));
                    dispatch(setCurrentTrackIndex(trackIndex));
                    console.log('✅ Synced with existing track:', currentTrackInfo.title);
                  }
                }
              }
            }
          } catch (error) {
            console.log('⚠️ TrackPlayer sync failed, falling back to loading first track...');
            // If TrackPlayer methods fail, fall back to loading first track
            await loadTrack(response.data.files[0], 0);
          }
        } else {
          console.log('🎵 Skipping track load:', { hasFiles: response.data.files.length > 0, hasCurrentTrack: !!currentTrack });
        }
      } else if (response.error) {
        console.error('❌ Failed to load audio files:', response.error);
        Alert.alert('Error', 'Failed to load audio files from server');
      }
    } catch (error) {
      console.error('❌ Error loading audio files:', error);
    } finally {
      dispatch(setLoading(false));
      console.log('🎵 Audio files loading completed');
    }
  };

  // Load audio files on component mount
  useEffect(() => {
    console.log('🎵 MusicPlayer: Component mounted, loading audio files...');
    loadAudioFiles();
  }, []);

  // Ensure track is loaded when audioFiles change and TrackPlayer is ready
  useEffect(() => {
    if (audioFiles.length > 0 && !currentTrack) {
      console.log('🎵 Audio files loaded but no current track, loading first track...');
      // Add a small delay to ensure TrackPlayer is fully ready
      setTimeout(() => {
        loadTrack(audioFiles[0], 0);
      }, 100);
    }
  }, [audioFiles, currentTrack]);

  // Load track into player
  const loadTrack = async (audioFile: AudioFile, index: number) => {
    try {
      console.log('🎵 Loading track:', audioFile.title || audioFile.fileName);
      
      // Create track object for TrackPlayer
      const track = {
        id: audioFile.fileName,
        url: audioFile.downloadUrl,
        title: audioFile.title ?? audioFile.fileName.replace(/\.[^/.]+$/, ""),
        artist: audioFile.artist ?? 'Guras',
      };

      console.log('🎵 Track object created:', track);

      dispatch(setCurrentTrack({ ...track, artworkUrl: audioFile.artworkUrl ?? null }));
      dispatch(setCurrentTrackIndex(index));

      // Stop current playback and load new track
      console.log('🎵 Resetting TrackPlayer...');
      await TrackPlayer.reset();
      
      console.log('🎵 Adding track to queue...');
      await TrackPlayer.add(track);
      
      // Verify track was added
      const queue = await TrackPlayer.getQueue();
      console.log('✅ Track added successfully. Queue length:', queue.length);
      console.log('✅ Queue contents:', queue);
      
    } catch (error) {
      console.error('❌ Error loading audio file:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };



  // Auto-advance to next track when current finishes
  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      if (audioFiles.length > 0) {
        console.log('🎵 Auto-advancing to next track...');
        
        // Calculate next track index
        const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
        const nextAudioFile = audioFiles[nextIndex];
        
        // Load the next track into TrackPlayer
        try {
          const track = {
            id: nextAudioFile.fileName,
            url: nextAudioFile.downloadUrl,
            title: nextAudioFile.title ?? nextAudioFile.fileName.replace(/\.[^/.]+$/, ""),
            artist: nextAudioFile.artist ?? 'Guras',
          };

          // Update Redux state
          dispatch(setCurrentTrack({ ...track, artworkUrl: nextAudioFile.artworkUrl ?? null }));
          dispatch(setCurrentTrackIndex(nextIndex));
          
          await TrackPlayer.reset();
          await TrackPlayer.add(track);
          
          // Auto-play the next track
          await TrackPlayer.play();
          console.log('✅ Auto-advance completed, playing:', track.title);
        } catch (error) {
          console.error('❌ Auto-advance failed:', error);
        }
      }
    });
    return () => {
      sub.remove();
    };
  }, [audioFiles, currentTrackIndex, dispatch]);



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
        <ImageBackground source={bgSource} blurRadius={16} style={styles.background} />
      )}
      
      {/* Track Name and Position */}
      <TrackName />

      {/* Center artwork fallback when no bg available */}
      {!bgSource && (
        <View style={styles.artworkContainer}>
          <View style={[
            styles.artworkFallback,
            { 
              backgroundColor: isDarkMode ? COLORS.GRAY_800 : COLORS.GRAY_200,
              borderWidth: 2,
              borderColor: isDarkMode ? COLORS.GRAY_600 : COLORS.GRAY_300
            }
          ]}>
            <FontAwesome 
              name="music" 
              size={48} 
              color={isDarkMode ? brandColors.primary : brandColors.primary} 
            />
          </View>
        </View>
      )}
      
      {/* Playback Controls - Only show when there are audio files */}
      {audioFiles.length > 0 && (
        <>
          <View style={styles.controlsContainer}>
            <PreviousButton />
            <PlayPauseButton />
            <NextButton />
          </View>
          

          
          <ProgressBar />
        </>
      )}
    </View>
  );
};

export default MusicPlayer; 