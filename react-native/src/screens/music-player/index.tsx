import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import MusicPlayer from './components/MusicPlayer';

const MusicPlayerScreen: React.FC = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      <MusicPlayer />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  scrollContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MusicPlayerScreen; 