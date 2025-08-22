import React, { useEffect, useCallback } from 'react';
import TrackPlayer, { State, Event } from 'react-native-track-player';
import { useMusicPlayer } from '@/contexts/MusicPlayerContext';
import { apiService, AudioFile } from '@/services/api';
// No Redux imports - using MusicPlayerContext only
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
  const {
    isSetup,
    audioFiles,
    currentTrackIndex,
    currentTrack,
    setAudioFiles,
    setCurrentTrackIndex,
    setCurrentTrack,
    setLoading
  } = useMusicPlayer();

  // Load audio files from API
  const loadAudioFiles = useCallback(async () => {
    console.log('🎵 MusicService: Starting to load audio files...');
    setLoading(true);
    try {
      const response = await apiService.getAudioFiles();
      console.log('🎵 MusicService: API response received:', response.data ? `${response.data.files.length} files` : 'No data');

      if (response.data) {
        setAudioFiles(response.data.files);
        console.log('🎵 MusicService: Audio files set in context:', response.data.files.length);

        // Load first track if no current track
        if (response.data.files.length > 0 && !currentTrack) {
          console.log('🎵 MusicService: Loading first track...');
          const files = response.data.files;
          setTimeout(() => {
            loadTrack(files[0], 0);
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
      setLoading(false);
      console.log('🎵 MusicService: Audio files loading completed');
    }
  }, [setAudioFiles, setLoading, currentTrack]);

  // Load track into player
  const loadTrack = async (audioFile: AudioFile, index: number) => {
    try {
      console.log('🎵 MusicService: Loading track:', audioFile.name);
      console.log('🎵 MusicService: AudioFile object:', audioFile);

      // Create track object for TrackPlayer
      const track = {
        id: audioFile.id,
        url: audioFile.audioDownloadUrl,
        title: audioFile.name,
        artist: audioFile.author,
      };

      console.log('🎵 MusicService: Track object created:', track);
      console.log('🎵 MusicService: Audio URL:', track.url);

      setCurrentTrack({ ...track, artwork: audioFile.thumbnailDownloadUrl || undefined });
      setCurrentTrackIndex(index);

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

  // Load audio files only after TrackPlayer is set up
  useEffect(() => {
    if (isSetup) {
      console.log('🎵 MusicService: TrackPlayer is ready, loading audio files...');
      loadAudioFiles();
    } else {
      console.log('🎵 MusicService: Waiting for TrackPlayer setup...');
    }
  }, [isSetup, loadAudioFiles]);

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
        
        console.log('🎵 MusicService: Auto-advancing to:', nextAudioFile.name);

        // Load the next track into TrackPlayer
        try {
          const track = {
            id: nextAudioFile.id,
            url: nextAudioFile.audioDownloadUrl,
            title: nextAudioFile.name,
            artist: nextAudioFile.author,
          };

          // Update context state
          setCurrentTrack({ ...track, artwork: nextAudioFile.thumbnailDownloadUrl || undefined });
          setCurrentTrackIndex(nextIndex);
          
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
  }, [audioFiles, currentTrackIndex, setCurrentTrack, setCurrentTrackIndex]);

  // This component renders nothing - it's a background service
  return null;
};

export default MusicService;
