import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MusicPlayer from './components/MusicPlayer';
import { MeditationTimer } from '@/components/shared';

const MusicPlayerScreen: React.FC = () => {
  const handleSessionComplete = (duration: number) => {
    // TODO: Track meditation session completion
    console.log(`Meditation session completed: ${duration} minutes`);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <MeditationTimer onSessionComplete={handleSessionComplete} />
      <MusicPlayer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});

export default MusicPlayerScreen; 