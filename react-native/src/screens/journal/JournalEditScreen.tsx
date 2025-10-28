import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { updateJournalEntry } from '@/store/journalSlice';
import { JournalEntry } from '@/types/journal';
import JournalEntryForm from '@/components/journal/JournalEntryForm';

interface JournalEditScreenProps {
  entry: JournalEntry;
  onClose: () => void;
}

const JournalEditScreen: React.FC<JournalEditScreenProps> = ({ entry, onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [content, setContent] = useState(entry.content);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
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
            title: entry.title,
            content: content.trim(),
            tags: entry.tags,
          },
        })
      ).unwrap();

      onClose();
    } catch (error: any) {
      const errorMessage = error?.message || error?.toString() || 'Failed to update journal entry';
      console.error('❌ Error in handleSave:', errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const isContentChanged = content !== entry.content;

  return (
    <JournalEntryForm
      mode="edit"
      content={content}
      onContentChange={setContent}
      onSave={handleSave}
      onClose={onClose}
      isLoading={isLoading}
      isDisabled={!content.trim() || !isContentChanged}
    />
  );
};

export default JournalEditScreen;

