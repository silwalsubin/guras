import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface JournalEntryFormProps {
  mode: 'create' | 'edit';
  content: string;
  onContentChange: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

const JournalEntryForm: React.FC<JournalEntryFormProps> = ({
  mode,
  content,
  onContentChange,
  onSave,
  onClose,
  isLoading,
  isDisabled,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const headerSubtitle = mode === 'create' ? 'Express your thoughts and feelings' : 'Update your thoughts and feelings';
  const buttonText = isLoading ? 'Saving...' : (mode === 'create' ? 'Save Entry' : 'Save Changes');
  const motivationalText = mode === 'create' ? 'Start writing to create your entry ✨' : 'Make changes to update your entry';

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
        <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
          {headerSubtitle}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Content Input - Full focus */}
        <View style={[styles.inputWrapper, { backgroundColor: themeColors.cardBackground, borderColor: themeColors.border }]}>
          <TextInput
            style={[
              styles.textInput,
              {
                color: themeColors.textPrimary,
              },
            ]}
            placeholder="Start writing..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            numberOfLines={12}
            value={content}
            onChangeText={onContentChange}
            textAlignVertical="top"
            autoFocus
            editable={!isLoading}
          />
          {/* Character count inside input box */}
          <Text style={[styles.charCountInside, { color: themeColors.textSecondary }]}>
            {content.length}
          </Text>
        </View>

        {/* Helpful Tips - Show when empty */}
        {content.length === 0 && (
          <View style={[styles.tipsContainer, { backgroundColor: brandColors.primary + '10', borderColor: brandColors.primary + '30' }]}>
            <FontAwesome name="lightbulb-o" size={16} color={brandColors.primary} style={styles.tipsIcon} />
            <View style={styles.tipsContent}>
              <Text style={[styles.tipsTitle, { color: brandColors.primary }]}>
                Tips for better entries
              </Text>
              <Text style={[styles.tipsText, { color: themeColors.textSecondary }]}>
                • Be honest and authentic{'\n'}
                • Write freely without judgment{'\n'}
                • Include your feelings and emotions
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Save Button at Bottom */}
      <View style={[styles.buttonContainer, { borderTopColor: themeColors.border }]}>
        {content.length === 0 && !isLoading && (
          <Text style={[styles.motivationalText, { color: themeColors.textSecondary }]}>
            {motivationalText}
          </Text>
        )}
        <TouchableOpacity
          onPress={onSave}
          disabled={isLoading || isDisabled}
          style={[
            styles.saveButtonFixed,
            {
              backgroundColor:
                isLoading || isDisabled ? themeColors.border : brandColors.primary,
            },
          ]}
        >
          <Text style={[styles.saveButtonText, { opacity: isLoading || isDisabled ? 0.6 : 1 }]}>
            {buttonText}
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
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 100,
    flex: 1,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    position: 'relative',
    minHeight: 280,
    flex: 1,
  },
  textInput: {
    fontSize: 16,
    lineHeight: 24,
    flex: 1,
    paddingRight: 50,
  },
  charCountInside: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    fontSize: 12,
    fontWeight: '500',
  },
  tipsContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginVertical: 16,
    alignItems: 'flex-start',
  },
  tipsIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  tipsText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
  },
  buttonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  motivationalText: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  saveButtonFixed: {
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.5,
  },
});

export default JournalEntryForm;

