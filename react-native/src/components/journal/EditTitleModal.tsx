import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface EditTitleModalProps {
  visible: boolean;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onClose: () => void;
}

const EditTitleModal: React.FC<EditTitleModalProps> = ({
  visible,
  currentTitle,
  onSave,
  onClose,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [title, setTitle] = useState(currentTitle);

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Title cannot be empty');
      return;
    }

    if (title.trim() === currentTitle.trim()) {
      onClose();
      return;
    }

    onSave(title.trim());
  };

  const handleClose = () => {
    setTitle(currentTitle);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: themeColors.background }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              Edit Title
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <TextInput
              style={[
                styles.titleInput,
                {
                  backgroundColor: themeColors.cardBackground,
                  color: themeColors.textPrimary,
                  borderColor: themeColors.border,
                },
              ]}
              placeholder="Enter new title..."
              placeholderTextColor={themeColors.textSecondary}
              value={title}
              onChangeText={setTitle}
              autoFocus
              maxLength={200}
            />
            <Text style={[styles.charCount, { color: themeColors.textSecondary }]}>
              {title.length}/200
            </Text>
          </View>

          {/* Buttons */}
          <View style={[styles.buttonContainer, { borderTopColor: themeColors.border }]}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: themeColors.border }]}
              onPress={handleClose}
            >
              <Text style={[styles.buttonText, { color: themeColors.textPrimary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: brandColors.primary }]}
              onPress={handleSave}
            >
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  titleInput: {
    borderWidth: 1.5,
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 22,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

export default EditTitleModal;

