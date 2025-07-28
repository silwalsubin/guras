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
import ProfileScreen from './src/components/ProfileScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import FontLoader from './src/components/FontLoader';
import { getThemeColors } from './src/config/colors';
import { Provider, useSelector, useDispatch } from 'react-redux';
import store, { RootState } from './src/store';
import { setActiveTab, TAB_KEYS } from './src/store/navigationSlice';
import { setDarkMode } from './src/store/themeSlice';
import MusicPlayer from './src/components/MusicPlayer';
import { MusicPlayerProvider } from './src/contexts/MusicPlayerContext';
import HomeScreen from './src/screens/HomeScreen';
import LearnScreen from './src/screens/LearnScreen';
import { BottomNavigation } from './src/components/shared';

function MainApp(): React.JSX.Element {
  const systemColorScheme = useColorScheme();
  const activeTab = useSelector((state: RootState) => state.navigation.activeTab);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDarkMode(systemColorScheme === 'dark'));
  }, [systemColorScheme, dispatch]);

  const themeColors = getThemeColors(isDarkMode);

  const backgroundStyle = {
    backgroundColor: themeColors.background,
  };

  const renderHomeScreen = () => <HomeScreen />;

  const renderMeditateScreen = () => (
    <View style={styles.tabContent}>
      <MusicPlayer />
    </View>
  );

  const renderLearnScreen = () => <LearnScreen />;

  const renderProfileScreen = () => (
    <ProfileScreen onBack={() => dispatch(setActiveTab(TAB_KEYS.HOME))} />
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case TAB_KEYS.HOME:
        return renderHomeScreen();
      case TAB_KEYS.AUDIO:
        return renderMeditateScreen();
      case TAB_KEYS.LEARN:
        return renderLearnScreen();
      case TAB_KEYS.PROFILE:
        return renderProfileScreen();
      default:
        return renderHomeScreen();
    }
  };

  return (
    <SafeAreaView style={[styles.container, backgroundStyle]}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      <View style={[
        styles.gradientBackground,
        {
          backgroundColor: themeColors.background,
        }
      ]}>
        <View style={[
          styles.gradientOverlay,
          {
            backgroundColor: themeColors.overlay,
          }
        ]} />
      </View>
      <View style={styles.mainContent}>
        <MusicPlayerProvider>
          {renderActiveTab()}
        </MusicPlayerProvider>
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
}

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
              <MainApp />
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
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  mainContent: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default App;
