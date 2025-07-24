import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import TrackPlayer, { State, usePlaybackState, useProgress } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/Feather';

const TRACK = {
  id: 'meditation_buddha',
  url: require('../../assets/meditation_buddha.mp3'),
  title: 'Meditation Buddha',
  artist: 'Guras',
};

const MusicPlayer: React.FC = () => {
  const playbackState = usePlaybackState();
  const progress = useProgress();
  const [isSetup, setIsSetup] = useState(false);

  useEffect(() => {
    async function setup() {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.reset();
      await TrackPlayer.add([TRACK]);
      setIsSetup(true);
    }
    setup();
    return () => { TrackPlayer.reset(); };
  }, []);

  const togglePlayback = async () => {
    if (!isSetup) return;
    const currentState = await TrackPlayer.getState();
    if (currentState === State.Playing) {
      await TrackPlayer.pause();
    } else {
      await TrackPlayer.play();
    }
  };

  const isPlaying = typeof playbackState === 'number' && playbackState === State.Playing;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{TRACK.title}</Text>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${(progress.position / (progress.duration || 1)) * 100}%` }]} />
      </View>
      <TouchableOpacity style={styles.playPauseButton} onPress={togglePlayback}>
        <Icon name={isPlaying ? 'pause' : 'play'} size={32} color="#14B8A6" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  progressBarContainer: {
    width: 240,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#14B8A6',
  },
  playPauseButton: {
    marginTop: 8,
    padding: 12,
    borderRadius: 24,
    backgroundColor: '#F0F8FF',
  },
});

export default MusicPlayer; 