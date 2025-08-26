import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { GuidedMeditationSession, MeditationTheme } from '@/types/meditation';
import ThemedSessionsBrowser from './ThemedSessionsBrowser';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ThemedSessionsModalProps {
  visible: boolean;
  onClose: () => void;
  onSessionSelect: (session: GuidedMeditationSession) => void;
  initialTheme?: MeditationTheme;
  title?: string;
}

const ThemedSessionsModal: React.FC<ThemedSessionsModalProps> = ({
  visible,
  onClose,
  onSessionSelect,
  initialTheme,
  title = 'Browse Sessions',
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const handleSessionSelect = (session: GuidedMeditationSession) => {
    onSessionSelect(session);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            {title}
          </Text>
          <View style={styles.placeholder} />
        </View>

        {/* Content */}
        <ThemedSessionsBrowser
          onSessionSelect={handleSessionSelect}
          initialTheme={initialTheme}
        />
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
});

export default ThemedSessionsModal;
