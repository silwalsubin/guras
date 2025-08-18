import TrackPlayer, { Event } from 'react-native-track-player';
import { store } from './src/store';
import { setCurrentTrack, setCurrentTrackIndex } from './src/store/musicPlayerSlice';

module.exports = async function() {
  TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
  TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());

  // Handle remote next track
  TrackPlayer.addEventListener(Event.RemoteNext, async () => {
    console.log('🎵 Remote Next pressed');
    const state = store.getState();
    const { audioFiles, currentTrackIndex } = state.musicPlayer;

    if (audioFiles.length > 1) {
      const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
      const nextAudioFile = audioFiles[nextIndex];

      console.log('🎵 Remote Next: Advancing to track:', nextIndex, nextAudioFile.name);

      // Create track object for TrackPlayer
      const track = {
        id: nextAudioFile.id,
        url: nextAudioFile.audioDownloadUrl,
        title: nextAudioFile.name,
        artist: nextAudioFile.author,
        artwork: nextAudioFile.thumbnailDownloadUrl,
      };

      // Update Redux state
      store.dispatch(setCurrentTrack({
        id: nextAudioFile.id,
        title: nextAudioFile.name,
        artist: nextAudioFile.author,
        url: nextAudioFile.audioDownloadUrl,
        artworkUrl: nextAudioFile.thumbnailDownloadUrl || null,
      }));
      store.dispatch(setCurrentTrackIndex(nextIndex));

      // Load and play the next track
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      await TrackPlayer.play();

      console.log('✅ Remote Next: Track loaded and playing:', track.title);
    }
  });

  // Handle remote previous track
  TrackPlayer.addEventListener(Event.RemotePrevious, async () => {
    console.log('🎵 Remote Previous pressed');
    const state = store.getState();
    const { audioFiles, currentTrackIndex } = state.musicPlayer;

    if (audioFiles.length > 1) {
      const prevIndex = currentTrackIndex === 0 ? audioFiles.length - 1 : currentTrackIndex - 1;
      const prevAudioFile = audioFiles[prevIndex];

      console.log('🎵 Remote Previous: Going to track:', prevIndex, prevAudioFile.name);

      // Create track object for TrackPlayer
      const track = {
        id: prevAudioFile.id,
        url: prevAudioFile.audioDownloadUrl,
        title: prevAudioFile.name,
        artist: prevAudioFile.author,
        artwork: prevAudioFile.thumbnailDownloadUrl,
      };

      // Update Redux state
      store.dispatch(setCurrentTrack({
        id: prevAudioFile.id,
        title: prevAudioFile.name,
        artist: prevAudioFile.author,
        url: prevAudioFile.audioDownloadUrl,
        artworkUrl: prevAudioFile.thumbnailDownloadUrl || null,
      }));
      store.dispatch(setCurrentTrackIndex(prevIndex));

      // Load and play the previous track
      await TrackPlayer.reset();
      await TrackPlayer.add(track);
      await TrackPlayer.play();

      console.log('✅ Remote Previous: Track loaded and playing:', track.title);
    }
  });
};