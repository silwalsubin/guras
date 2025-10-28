import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { createJournalEntry } from '@/store/journalSlice';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface JournalCreateScreenProps {
  onClose: () => void;
}

const JournalCreateScreen: React.FC<JournalCreateScreenProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your journal entry');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        createJournalEntry({
          userId: '', // Will be set by the backend based on auth token
          data: {
            content: content.trim(),
            tags: [],
          },
        })
      ).unwrap();

      Alert.alert('Success', 'Journal entry created successfully');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to create journal entry';
      console.error('❌ Error in handleSave:', errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeButton}
        >
          <FontAwesome name="chevron-down" size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Write
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Content Input */}
        <View style={styles.contentSection}>
          <Text style={[styles.label, { color: themeColors.textPrimary }]}>
            What's on your mind?
          </Text>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: themeColors.cardBackground,
                color: themeColors.textPrimary,
                borderColor: themeColors.border,
              },
            ]}
            placeholder="Write your thoughts and feelings here..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={10}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>

        {/* Character count */}
        <Text style={[styles.charCount, { color: themeColors.textSecondary }]}>
          {content.length} characters
        </Text>
      </ScrollView>

      {/* Fixed Save Button at Bottom */}
      <View style={[styles.buttonContainer, { borderTopColor: themeColors.border }]}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={isLoading || !content.trim()}
          style={[
            styles.saveButtonFixed,
            {
              backgroundColor:
                isLoading || !content.trim() ? themeColors.border : brandColors.primary,
            },
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Entry'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 100,
  },
  contentSection: {
    marginVertical: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 150,
    lineHeight: 20,
  },
  charCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 8,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  saveButtonFixed: {
    paddingVertical: 16,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default JournalCreateScreen;

