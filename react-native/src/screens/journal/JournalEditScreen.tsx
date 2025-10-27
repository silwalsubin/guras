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
  Keyboard,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { updateJournalEntry } from '@/store/journalSlice';
import { JournalEntry } from '@/types/journal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface JournalEditScreenProps {
  entry: JournalEntry;
  onClose: () => void;
}

const JournalEditScreen: React.FC<JournalEditScreenProps> = ({ entry, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [title, setTitle] = useState(entry.title);
  const [content, setContent] = useState(entry.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!content.trim()) {
      Alert.alert('Error', 'Please write something in your journal entry');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(
        updateJournalEntry({
          entryId: entry.id,
          data: {
            title: title.trim(),
            content: content.trim(),
            tags: entry.tags,
          },
        })
      ).unwrap();

      Alert.alert('Success', 'Journal entry updated successfully');
      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update journal entry';
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
          Edit Entry
        </Text>
        <TouchableOpacity
          onPress={() => Keyboard.dismiss()}
          style={styles.keyboardDismissButton}
        >
          <FontAwesome name="keyboard-o" size={20} color={themeColors.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title Input */}
        <View style={styles.titleSection}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Title
          </Text>
          <TextInput
            style={[
              styles.titleInput,
              {
                backgroundColor: themeColors.cardBackground,
                color: themeColors.textPrimary,
                borderColor: themeColors.border,
              },
            ]}
            placeholder="Enter title..."
            placeholderTextColor={themeColors.textSecondary}
            value={title}
            onChangeText={setTitle}
            editable={!isLoading}
          />
        </View>

        {/* Content Input */}
        <View style={styles.contentSection}>
          <Text style={[styles.label, { color: themeColors.textSecondary }]}>
            Content
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: themeColors.cardBackground,
                color: themeColors.textPrimary,
                borderColor: themeColors.border,
              },
            ]}
            placeholder="Edit your journal entry..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={12}
            value={content}
            onChangeText={setContent}
            editable={!isLoading}
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
          disabled={isLoading || !title.trim() || !content.trim() || (title === entry.title && content === entry.content)}
          style={[
            styles.saveButtonFixed,
            {
              backgroundColor:
                isLoading || !title.trim() || !content.trim() || (title === entry.title && content === entry.content)
                  ? themeColors.border
                  : brandColors.primary,
            },
          ]}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : 'Save Changes'}
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
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardDismissButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 100, // Extra space for button at bottom
  },
  titleSection: {
    marginBottom: 24,
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  contentSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    marginTop: 8,
    marginBottom: 20,
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 20,
    borderTopWidth: 1,
  },
  saveButtonFixed: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default JournalEditScreen;

