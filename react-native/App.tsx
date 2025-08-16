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
import { TAB_KEYS } from './src/store/navigationSlice';
import { setDarkMode } from './src/store/themeSlice';
import { MusicPlayerProvider } from './src/contexts/MusicPlayerContext';
import MeditationScreen from './src/screens/meditation';
import LearnScreen from './src/screens/learn';
import AudioScreen from './src/screens/audio';
import HomeScreen from './src/screens/home';
import BottomNavigation from './src/components/app/navigation/BottomNavigation';
import notificationService from './src/services/notificationService';

// Move MainApp outside of App function to fix Redux connection
const MainApp: React.FC = () => {
  const systemColorScheme = useColorScheme();
  const activeTab = useSelector((state: RootState) => state.navigation.activeTab);
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setDarkMode(systemColorScheme === 'dark'));
  }, [systemColorScheme, dispatch]);

  // Notification service initializes itself in constructor
  useEffect(() => {
    console.log('Notification service available');
  }, []);

  const themeColors = getThemeColors(isDarkMode);

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
      
      <View style={styles.mainContent}>
        <MusicPlayerProvider>
          {renderActiveTab()}
        </MusicPlayerProvider>
      </View>

      <BottomNavigation />
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
  mainContent: {
    flex: 1,
  },
});

export default App;
