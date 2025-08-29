import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { getBrandColors } from '@/config/colors';
import { MeditationTrack } from '@/contexts/MusicPlayerContext';
import DurationSelector from '@/components/shared/DurationSelector';
import MeditationMusicSelector from '@/components/shared/MeditationMusicSelector';
import SemiTransparentCard from '@/components/shared/SemiTransparentCard';

interface MeditationSetupCardProps {
  selectedDuration: number;
  onDurationSelect: (minutes: number) => void;
  selectedTrack: MeditationTrack | null;
  onTrackSelect: (track: MeditationTrack | null) => void;
  onStartTimer: () => void;
  disabled?: boolean;
}

const MeditationSetupCard: React.FC<MeditationSetupCardProps> = ({
  selectedDuration,
  onDurationSelect,
  selectedTrack,
  onTrackSelect,
  onStartTimer,
  disabled = false,
}) => {
  const brandColors = getBrandColors();

  return (
    <SemiTransparentCard>
      {/* Duration Selector */}
      <DurationSelector
        selectedDuration={selectedDuration}
        onDurationSelect={onDurationSelect}
        disabled={disabled}
      />

      {/* Music Selection */}
      <View style={styles.musicSelectionContainer}>
        <MeditationMusicSelector
          selectedTrack={selectedTrack}
          onTrackSelect={onTrackSelect}
          disabled={disabled}
        />
      </View>

      {/* Start Button */}
      <View style={styles.startButtonContainer}>
        <TouchableOpacity
          style={[
            styles.circularStartButton,
            {
              backgroundColor: brandColors.primary,
              shadowColor: brandColors.primary,
              opacity: disabled ? 0.6 : 1,
            }
          ]}
          onPress={onStartTimer}
          disabled={disabled}
        >
          <Text style={styles.startButtonText}>Start</Text>
        </TouchableOpacity>
      </View>
    </SemiTransparentCard>
  );
};

const styles = StyleSheet.create({
  musicSelectionContainer: {
    marginBottom: 0,
  },
  startButtonContainer: {
    marginTop: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularStartButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default MeditationSetupCard;
