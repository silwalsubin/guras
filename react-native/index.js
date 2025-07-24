/**
 * @format
 */

// Suppress TrackPlayer sleep timer warnings early
const originalWarn = console.warn;
console.warn = (...args) => {
  const message = args[0];
  if (typeof message === 'string' && (
    message.includes('getSleepTimerProgress') ||
    message.includes('setSleepTimer') ||
    message.includes('sleepWhenActiveTrackReachesEnd') ||
    message.includes('clearSleepTimer')
  )) {
    return; // Suppress sleep timer warnings
  }
  originalWarn.apply(console, args);
};

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import trackPlayerService from './trackPlayerService';

TrackPlayer.registerPlaybackService(() => trackPlayerService);

AppRegistry.registerComponent(appName, () => App);
