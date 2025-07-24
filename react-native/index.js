/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import TrackPlayer from 'react-native-track-player';
import trackPlayerService from './trackPlayerService';

TrackPlayer.registerPlaybackService(() => trackPlayerService);

AppRegistry.registerComponent(appName, () => App);
