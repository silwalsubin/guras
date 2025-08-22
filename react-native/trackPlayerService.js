import TrackPlayer, { Event } from 'react-native-track-player';

// Simplified track player service - MusicPlayerContext handles advanced functionality
module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => {
    console.log('🎵 Remote Play pressed');
    TrackPlayer.play();
  });

  TrackPlayer.addEventListener(Event.RemotePause, () => {
    console.log('🎵 Remote Pause pressed');
    TrackPlayer.pause();
  });

  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('🎵 Remote Next pressed - basic skip');
    try {
      await TrackPlayer.skipToNext();
    } catch (error) {
      console.log('🎵 No next track available');
    }
  });

  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('🎵 Remote Previous pressed - basic skip');
    try {
      await TrackPlayer.skipToPrevious();
    } catch (error) {
      console.log('🎵 No previous track available');
    }
  });
};