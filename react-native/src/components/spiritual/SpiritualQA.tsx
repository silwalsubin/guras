import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { askSpiritualQuestion, addMessage } from '@/store/spiritualTeacherSlice';
import { SpiritualMessage } from '@/types/spiritual';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface SpiritualQAProps {
  onClose?: () => void;
}

const SpiritualQA: React.FC<SpiritualQAProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const { currentConversation, isLoading, currentTeacher } = useSelector(
    (state: RootState) => state.spiritualTeacher
  );

  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (currentConversation?.messages) {
      scrollToBottom();
    }
  }, [currentConversation?.messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      Alert.alert('Please enter a question', 'Ask Osho anything about meditation, life, or spirituality.');
      return;
    }

    if (isLoading) return;

    try {
      setIsTyping(true);
      await dispatch(askSpiritualQuestion(question.trim()));
      setQuestion('');
    } catch (error) {
      Alert.alert('Error', 'Failed to get spiritual guidance. Please try again.');
    } finally {
      setIsTyping(false);
    }
  };

  const renderMessage = (message: SpiritualMessage, index: number) => {
    const isUser = message.role === 'user';
    
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.teacherMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: isUser ? brandColors.primary : themeColors.card,
              borderColor: isUser ? brandColors.primary : themeColors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.messageText,
              {
                color: isUser ? '#FFFFFF' : themeColors.textPrimary,
              },
            ]}
          >
            {message.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              {
                color: isUser ? '#FFFFFF' : themeColors.textSecondary,
              },
            ]}
          >
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => {
    if (!isTyping) return null;

    return (
      <View style={[styles.messageContainer, styles.teacherMessage]}>
        <View
          style={[
            styles.messageBubble,
            {
              backgroundColor: themeColors.card,
              borderColor: themeColors.border,
            },
          ]}
        >
          <View style={styles.typingContainer}>
            <Text style={[styles.typingText, { color: themeColors.textSecondary }]}>
              {currentTeacher?.name || 'Osho'} is thinking...
            </Text>
            <View style={styles.typingDots}>
              <View style={[styles.dot, { backgroundColor: themeColors.textSecondary }]} />
              <View style={[styles.dot, { backgroundColor: themeColors.textSecondary }]} />
              <View style={[styles.dot, { backgroundColor: themeColors.textSecondary }]} />
            </View>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <FontAwesome name="question-circle" size={48} color={themeColors.textSecondary} />
        <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
          Ask Osho Anything
        </Text>
        <Text style={[styles.emptyStateDescription, { color: themeColors.textSecondary }]}>
          Get personalized spiritual guidance from Osho's wisdom. Ask about meditation, love, awareness, or any aspect of your spiritual journey.
        </Text>
        
        <View style={styles.suggestionContainer}>
          <Text style={[styles.suggestionTitle, { color: themeColors.textPrimary }]}>
            Try asking:
          </Text>
          {[
            "What is meditation?",
            "How can I find inner peace?",
            "What is the meaning of love?",
            "How do I deal with stress?",
            "What is awareness?"
          ].map((suggestion, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.suggestionChip, { backgroundColor: themeColors.card }]}
              onPress={() => setQuestion(suggestion)}
            >
              <Text style={[styles.suggestionText, { color: themeColors.textSecondary }]}>
                "{suggestion}"
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: themeColors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerContent}>
          <View style={styles.teacherInfo}>
            <View style={[styles.teacherAvatar, { backgroundColor: brandColors.primary }]}>
              <Text style={styles.teacherAvatarText}>O</Text>
            </View>
            <View>
              <Text style={[styles.teacherName, { color: themeColors.textPrimary }]}>
                {currentTeacher?.displayName || 'Osho'}
              </Text>
              <Text style={[styles.teacherStatus, { color: themeColors.textSecondary }]}>
                Spiritual Teacher
              </Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {currentConversation?.messages?.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            {currentConversation?.messages?.map((message, index) =>
              renderMessage(message, index)
            )}
            {renderTypingIndicator()}
          </>
        )}
      </ScrollView>

      {/* Input */}
      <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={[
              styles.textInput,
              {
                backgroundColor: themeColors.background,
                color: themeColors.textPrimary,
                borderColor: themeColors.border,
              },
            ]}
            value={question}
            onChangeText={setQuestion}
            placeholder="Ask Osho about meditation, life, or spirituality..."
            placeholderTextColor={themeColors.textSecondary}
            multiline
            maxLength={500}
            editable={!isLoading}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor: question.trim() ? brandColors.primary : themeColors.border,
              },
            ]}
            onPress={handleAskQuestion}
            disabled={!question.trim() || isLoading}
            activeOpacity={0.8}
          >
            <FontAwesome
              name="paper-plane"
              size={16}
              color={question.trim() ? '#FFFFFF' : themeColors.textSecondary}
            />
          </TouchableOpacity>
        </View>
        <Text style={[styles.characterCount, { color: themeColors.textSecondary }]}>
          {question.length}/500
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  teacherAvatarText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '600',
  },
  teacherStatus: {
    fontSize: 12,
  },
  closeButton: {
    padding: 5,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 15,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  teacherMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  typingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    marginRight: 8,
  },
  typingDots: {
    flexDirection: 'row',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 2,
    opacity: 0.7,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 30,
  },
  suggestionContainer: {
    width: '100%',
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  suggestionChip: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionText: {
    fontSize: 14,
    textAlign: 'center',
  },
  inputContainer: {
    padding: 20,
    borderTopWidth: 1,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
});

export default SpiritualQA;
