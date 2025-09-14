import TrackPlayer from 'react-native-track-player';
import { Alert } from 'react-native';

export interface MeditationAudioCue {
  id: string;
  title: string;
  url: string;
  type: 'start' | 'end';
}

class MeditationAudioService {
  private isInitialized = false;

  // Local audio cues - these would be actual audio files in your assets
  private defaultCues: MeditationAudioCue[] = [
    {
      id: 'meditation-start',
      title: 'Meditation Start Bell',
      url: 'meditation-start', // This will be a local asset
      type: 'start'
    },
    {
      id: 'meditation-end',
      title: 'Meditation End Bell',
      url: 'meditation-end', // This will be a local asset
      type: 'end'
    }
  ];

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // TrackPlayer is initialized by MusicPlayerContext - just mark as ready
      this.isInitialized = true;
      console.log('✅ Meditation audio service initialized (TrackPlayer managed by MusicPlayerContext)');
    } catch (error) {
      console.error('❌ Failed to initialize meditation audio service:', error);
      throw error;
    }
  }

  async playStartCue(): Promise<void> {
    try {
      await this.initialize();
      
      // For now, we'll use alerts since we don't have actual audio files
      // In a real implementation, you would:
      // 1. Add actual audio files to your assets (e.g., meditation-start.mp3)
      // 2. Use require() to load them: require('../../assets/meditation-start.mp3')
      // 3. Use TrackPlayer.add() and TrackPlayer.play() to play them
      
      console.log('🔔 Playing meditation start sound');
      
      // TODO: Replace with actual audio file when available
      // const startCue = this.defaultCues.find(cue => cue.type === 'start');
      // if (startCue) {
      //   await TrackPlayer.reset();
      //   await TrackPlayer.add({
      //     id: startCue.id,
      //     url: require('../../assets/meditation-start.mp3'),
      //     title: startCue.title,
      //   });
      //   await TrackPlayer.play();
      // }
      
    } catch (error) {
      console.error('❌ Failed to play start cue:', error);
      // No fallback alert needed - main confirmation handles this
    }
  }

  async playEndCue(): Promise<void> {
    try {
      await this.initialize();
      
      console.log('🔔 Playing meditation end sound');
      
      // TODO: Replace with actual audio file when available
      // const endCue = this.defaultCues.find(cue => cue.type === 'end');
      // if (endCue) {
      //   await TrackPlayer.reset();
      //   await TrackPlayer.add({
      //     id: endCue.id,
      //     url: require('../../assets/meditation-end.mp3'),
      //     title: endCue.title,
      //   });
      //   await TrackPlayer.play();
      // }
      
    } catch (error) {
      console.error('❌ Failed to play end cue:', error);
      // Fallback: show alert for now
      Alert.alert('Meditation Complete', 'Great job! You\'ve completed your meditation session.');
    }
  }

  async stopAudio(): Promise<void> {
    try {
      if (this.isInitialized) {
        await TrackPlayer.stop();
        await TrackPlayer.reset();
      }
    } catch (error) {
      console.error('❌ Failed to stop audio:', error);
    }
  }

  // Method to add custom audio cues
  async addCustomCue(cue: MeditationAudioCue): Promise<void> {
    this.defaultCues.push(cue);
  }

  // Method to get available cues
  getAvailableCues(): MeditationAudioCue[] {
    return [...this.defaultCues];
  }
}

export default new MeditationAudioService();
