import React, { useState } from 'react';
import { Alert } from 'react-native';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/store';
import { createJournalEntry } from '@/store/journalSlice';
import JournalEntryForm from '@/components/journal/JournalEntryForm';

interface JournalCreateScreenProps {
  onClose: () => void;
}

const JournalCreateScreen: React.FC<JournalCreateScreenProps> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
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
    <JournalEntryForm
      mode="create"
      content={content}
      onContentChange={setContent}
      onSave={handleSave}
      onClose={onClose}
      isLoading={isLoading}
      isDisabled={!content.trim()}
    />
  );
};

export default JournalCreateScreen;

