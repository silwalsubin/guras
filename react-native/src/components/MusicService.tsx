import React, { useEffect } from 'react';
import TrackPlayer, { State, Event } from 'react-native-track-player';
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
import { Alert } from 'react-native';

/**
 * Background music service component that handles:
 * - Loading audio files from API
 * - Managing track playback
 * - Auto-advancing tracks
 * - Maintaining music state
 * 
 * This component has no UI and runs in the background
 */
const MusicService: React.FC = () => {
  const { isSetup } = useMusicPlayer();
  const dispatch = useDispatch();
  
  // Get all music player state from Redux
  const {
    audioFiles,
    currentTrackIndex,
    currentTrack,
  } = useSelector((state: RootState) => state.musicPlayer);

  // Load audio files from API
  const loadAudioFiles = async () => {
    console.log('🎵 MusicService: Starting to load audio files...');
    dispatch(setLoading(true));
    try {
      const response = await apiService.getAudioFiles();
      console.log('🎵 MusicService: API response received:', response.data ? `${response.data.files.length} files` : 'No data');
      
      if (response.data) {
        dispatch(setAudioFiles(response.data.files));
        console.log('🎵 MusicService: Audio files dispatched to Redux:', response.data.files.length);

        // Load first track if no current track
        if (response.data.files.length > 0 && !currentTrack) {
          console.log('🎵 MusicService: Loading first track...');
          setTimeout(() => {
            loadTrack(response.data.files[0], 0);
          }, 100);
        } else {
          console.log('🎵 MusicService: Skipping track load:', { hasFiles: response.data.files.length > 0, hasCurrentTrack: !!currentTrack });
        }
      } else if (response.error) {
        console.error('❌ MusicService: Failed to load audio files:', response.error);
        Alert.alert('Error', 'Failed to load audio files from server');
      }
    } catch (error) {
      console.error('❌ MusicService: Error loading audio files:', error);
    } finally {
      dispatch(setLoading(false));
      console.log('🎵 MusicService: Audio files loading completed');
    }
  };

  // Load track into player
  const loadTrack = async (audioFile: AudioFile, index: number) => {
    try {
      console.log('🎵 MusicService: Loading track:', audioFile.title || audioFile.fileName);
      console.log('🎵 MusicService: AudioFile object:', audioFile);

      // Create track object for TrackPlayer (handle both old and new API formats)
      const track = {
        id: audioFile.id || audioFile.fileName || audioFile.name,
        url: audioFile.audioDownloadUrl || audioFile.downloadUrl,
        title: audioFile.name || audioFile.title || (audioFile.fileName ? audioFile.fileName.replace(/\.[^/.]+$/, "") : 'Unknown Track'),
        artist: audioFile.author || audioFile.artist || 'Guras',
      };

      console.log('🎵 MusicService: Track object created:', track);
      console.log('🎵 MusicService: Audio URL:', track.url);

      dispatch(setCurrentTrack({ ...track, artworkUrl: audioFile.thumbnailDownloadUrl || audioFile.artworkUrl || null }));
      dispatch(setCurrentTrackIndex(index));

      // Stop current playback and load new track
      console.log('🎵 MusicService: Resetting TrackPlayer...');
      await TrackPlayer.reset();
      
      console.log('🎵 MusicService: Adding track to queue...');
      await TrackPlayer.add(track);
      
      // Verify track was added
      const queue = await TrackPlayer.getQueue();
      console.log('✅ MusicService: Track added successfully. Queue length:', queue.length);
      
    } catch (error) {
      console.error('❌ MusicService: Error loading audio file:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  // Load audio files on component mount
  useEffect(() => {
    console.log('🎵 MusicService: Component mounted, loading audio files...');
    loadAudioFiles();
  }, []);

  // Ensure track is loaded when audioFiles change and TrackPlayer is ready
  useEffect(() => {
    if (audioFiles.length > 0 && !currentTrack) {
      console.log('🎵 MusicService: Audio files loaded but no current track, loading first track...');
      // Add a small delay to ensure TrackPlayer is fully ready
      setTimeout(() => {
        loadTrack(audioFiles[0], 0);
      }, 100);
    }
  }, [audioFiles, currentTrack]);

  // Handle auto-advance to next track when current track ends
  useEffect(() => {
    const sub = TrackPlayer.addEventListener(Event.PlaybackQueueEnded, async () => {
      console.log('🎵 MusicService: Track ended, auto-advancing...');
      
      if (audioFiles.length > 0) {
        const nextIndex = (currentTrackIndex + 1) % audioFiles.length;
        const nextAudioFile = audioFiles[nextIndex];
        
        console.log('🎵 MusicService: Auto-advancing to:', nextAudioFile.title || nextAudioFile.fileName);
        
        // Load the next track into TrackPlayer
        try {
          const track = {
            id: nextAudioFile.id || nextAudioFile.fileName || nextAudioFile.name,
            url: nextAudioFile.audioDownloadUrl || nextAudioFile.downloadUrl,
            title: nextAudioFile.name || nextAudioFile.title || (nextAudioFile.fileName ? nextAudioFile.fileName.replace(/\.[^/.]+$/, "") : 'Unknown Track'),
            artist: nextAudioFile.author || nextAudioFile.artist || 'Guras',
          };

          // Update Redux state
          dispatch(setCurrentTrack({ ...track, artworkUrl: nextAudioFile.thumbnailDownloadUrl || nextAudioFile.artworkUrl || null }));
          dispatch(setCurrentTrackIndex(nextIndex));
          
          await TrackPlayer.reset();
          await TrackPlayer.add(track);
          
          // Auto-play the next track
          await TrackPlayer.play();
          console.log('✅ MusicService: Auto-advance completed, playing:', track.title);
        } catch (error) {
          console.error('❌ MusicService: Auto-advance failed:', error);
        }
      }
    });
    return () => {
      sub.remove();
    };
  }, [audioFiles, currentTrackIndex, dispatch]);

  // This component renders nothing - it's a background service
  return null;
};

export default MusicService;
