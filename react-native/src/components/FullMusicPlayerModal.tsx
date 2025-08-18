import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
  StatusBar,
  ImageBackground,
  Animated,
  Image
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { setFullPlayerVisible } from '@/store/musicPlayerSlice';
import { getThemeColors, getBrandColors, COLORS } from '@/config/colors';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Feather from 'react-native-vector-icons/Feather';

// Import existing music player components
import TrackName from '@/screens/audio/music-player/track-name';
import PreviousButton from '@/screens/audio/music-player/music-controls/previous-button';
import PlayPauseButton from '@/screens/audio/music-player/music-controls/play-pause-button';
import NextButton from '@/screens/audio/music-player/music-controls/next-button';
import ProgressBar from '@/screens/audio/music-player/progress-bar';

const FullMusicPlayerModal: React.FC = () => {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state: RootState) => state.theme);
  const { isFullPlayerVisible, currentTrack } = useSelector((state: RootState) => state.musicPlayer);

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const handleClose = () => {
    dispatch(setFullPlayerVisible(false));
  };

  // Background image source - use the thumbnail from Redux
  const bgSource = currentTrack?.artworkUrl ? { uri: currentTrack.artworkUrl } : null;

  return (
    <Modal
      visible={isFullPlayerVisible}
      animationType="slide"
      presentationStyle="fullScreen"
      statusBarTranslucent={true}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar 
          barStyle={isDarkMode ? 'light-content' : 'dark-content'} 
          backgroundColor="transparent" 
          translucent 
        />
        
        {/* Background Image */}
        {bgSource && (
          <ImageBackground source={bgSource} blurRadius={16} style={styles.background} />
        )}
        
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={[styles.closeButton, { backgroundColor: themeColors.card }]} 
            onPress={handleClose}
          >
            <Feather name="chevron-down" size={24} color={themeColors.textPrimary} />
          </TouchableOpacity>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Album Artwork Section */}
          <View style={styles.artworkSection}>
            <View style={styles.artworkContainer}>
              {currentTrack?.artworkUrl ? (
                <Image
                  source={{ uri: currentTrack.artworkUrl }}
                  style={styles.artwork}
                  resizeMode="cover"
                />
              ) : (
                <View style={[
                  styles.artworkFallback,
                  {
                    backgroundColor: isDarkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    borderWidth: 1,
                    borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'
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
          </View>

          {/* Playback Controls - Only show when there's a current track */}
          {currentTrack && (
            <View style={styles.playerSection}>
              <View style={styles.controlsContainer}>
                <PreviousButton />
                <PlayPauseButton />
                <NextButton />
              </View>

              <View style={styles.progressSection}>
                <ProgressBar />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 10,
  },
  closeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingBottom: 40,
  },
  artworkSection: {
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 20,
  },
  artworkContainer: {
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  artwork: {
    width: 280,
    height: 280,
    borderRadius: 24,
  },
  artworkFallback: {
    width: 280,
    height: 280,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackInfoSection: {
    flex: 0.8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
  },
  playerSection: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: 240,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  progressSection: {
    width: '100%',
    paddingHorizontal: 8,
  },
});

export default FullMusicPlayerModal;
