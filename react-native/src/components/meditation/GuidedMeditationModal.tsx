import React from 'react';
import {
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors } from '@/config/colors';
import { GuidedMeditationSession } from '@/types/meditation';
import GuidedMeditationPlayer from './GuidedMeditationPlayer';

interface GuidedMeditationModalProps {
  visible: boolean;
  session: GuidedMeditationSession | null;
  onClose: () => void;
  onSessionComplete?: (session: GuidedMeditationSession) => void;
}

const GuidedMeditationModal: React.FC<GuidedMeditationModalProps> = ({
  visible,
  session,
  onClose,
  onSessionComplete,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  if (!session) return null;

  const handleSessionComplete = (completedSession: GuidedMeditationSession) => {
    if (onSessionComplete) {
      onSessionComplete(completedSession);
    }
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={themeColors.background}
        />
        <GuidedMeditationPlayer
          session={session}
          onSessionComplete={handleSessionComplete}
          onClose={onClose}
          forceFullScreen={true}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default GuidedMeditationModal;
