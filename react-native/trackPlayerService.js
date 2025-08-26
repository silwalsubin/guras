import TrackPlayer, { Event } from 'react-native-track-player';
import { DeviceEventEmitter } from 'react-native';

// Track player service with consistent remote command handling
module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('🎵 Remote Play pressed - forwarding to MusicPlayerContext');
    DeviceEventEmitter.emit('RemotePlay');
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('🎵 Remote Pause pressed - forwarding to MusicPlayerContext');
    DeviceEventEmitter.emit('RemotePause');
  });

  TrackPlayer.addEventListener(Event.RemoteNext, () => {
    console.log('🎵 Remote Next pressed - forwarding to MusicPlayerContext');
    DeviceEventEmitter.emit('RemoteNext');
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, () => {
    console.log('🎵 Remote Previous pressed - forwarding to MusicPlayerContext');
    DeviceEventEmitter.emit('RemotePrevious');
  });
};