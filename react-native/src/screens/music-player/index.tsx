import React from 'react';
import { View, StyleSheet } from 'react-native';
import MusicPlayer from './components/MusicPlayer';

const MusicPlayerScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <MusicPlayer />
    </View>
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