import React, { useEffect } from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';
import AuthWrapper from './src/components/AuthWrapper';
import ProfileScreen from './src/screens/profile';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import FontLoader from './src/components/app/FontLoader';
import { getThemeColors } from './src/config/colors';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store, { RootState } from './src/store';
import { setActiveTab, TAB_KEYS } from './src/store/navigationSlice';
import { setDarkMode } from './src/store/themeSlice';
import { stopTimer } from './src/store/meditationSliceNew';
import { MusicPlayerProvider, useMusicPlayer } from './src/contexts/MusicPlayerContext';
import MeditationScreen from './src/screens/meditation';
import LearnScreen from './src/screens/learn';
import AudioScreen from './src/screens/audio';
import HomeScreen from './src/screens/home';
import BottomNavigation from './src/components/app/navigation/BottomNavigation';
import notificationService from './src/services/notificationService';
import MiniMusicPlayer from './src/components/MiniMusicPlayer';
import FullMusicPlayerModal from './src/components/FullMusicPlayerModal';

// Move MainApp outside of App function to fix Redux connection
const MainApp: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const activeTab = useSelector((state: RootState) => state.navigation.activeTab);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isFullScreenMeditation = useSelector((state: RootState) => state.meditation.isFullScreen);
  const isMeditationActive = useSelector((state: RootState) => state.meditation.isActive);
  const dispatch = useDispatch();

  // Access MusicPlayerContext
  const { setFullPlayerVisible } = useMusicPlayer();



  // Handler for when mini music player is tapped
  const handleMiniPlayerPress = () => {
    console.log('Mini player pressed - opening full player');
    setFullPlayerVisible(true);
  };

  useEffect(() => {
    dispatch(setDarkMode(systemColorScheme === 'dark'));
  }, [systemColorScheme, dispatch]);

  // Reset meditation state only when it's stuck (full-screen but not active)
  // TEMPORARILY DISABLED to fix natural completion
  // useEffect(() => {
  //   if (isFullScreenMeditation && !isMeditationActive) {
  //     console.log('🔧 Resetting stuck meditation state (full-screen but not active)');
  //     dispatch(stopTimer());
  //   }
  // }, [isFullScreenMeditation, isMeditationActive, dispatch]);

  // Notification service initializes itself in constructor
  useEffect(() => {
    console.log('Notification service available');
  }, []);

  const themeColors = getThemeColors(isDarkMode);

  // Dynamic styles based on active tab
  const getMainContentStyle = () => {
    const baseStyle = styles.mainContent;
    // Only add extra padding for mini player when on Audio tab
    if (activeTab === TAB_KEYS.AUDIO) {
      return [baseStyle, { paddingBottom: 140 }]; // 60px mini player + 80px footer
    }
    // For all other tabs, add bottom padding to account for bottom navigation
    return [baseStyle, { paddingBottom: 0 }]; // Let individual screens handle their own bottom padding
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case TAB_KEYS.HOME:
        return <HomeScreen />;
      case TAB_KEYS.MEDITATION:
        return <MeditationScreen />;
      case TAB_KEYS.AUDIO:
        return <AudioScreen />;
      case TAB_KEYS.LEARN:
        return <LearnScreen />;
      case TAB_KEYS.PROFILE:
        return <ProfileScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />

      {/* Music functionality is now handled by MusicPlayerContext */}

      <View style={getMainContentStyle()}>
        {renderActiveTab()}
      </View>

      {/* Mini Music Player - Shows above bottom navigation when music is playing */}
      {!isFullScreenMeditation && (
        <MiniMusicPlayer
          onPress={handleMiniPlayerPress}
          style={styles.miniPlayer}
        />
      )}

      {/* Full Music Player Modal */}
      <FullMusicPlayerModal />

      {/* Bottom Navigation - Hidden during full-screen meditation */}
      {!isFullScreenMeditation && <BottomNavigation />}
    </SafeAreaView>
  );
};

function App(): React.JSX.Element {
  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '393821350316-v39tafbkk5cf6p5visoqaqrd5foe6vmk.apps.googleusercontent.com',
    });
  }, []);

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <FontLoader>
          <AuthProvider>
            <AuthWrapper>
              <MusicPlayerProvider>
                <MainApp />
              </MusicPlayerProvider>
            </AuthWrapper>
          </AuthProvider>
        </FontLoader>
      </SafeAreaProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainContent: {
    flex: 1,
    // Padding is now dynamic based on active tab
  },
  miniPlayer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 100, // Position above the footer, not overlapping it
    zIndex: 100,
  },
});

export default App;
