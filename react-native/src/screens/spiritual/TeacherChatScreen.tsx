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
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { askSpiritualQuestion } from '@/store/spiritualTeacherSlice';
import { SpiritualMessage } from '@/types/spiritual';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface TeacherChatScreenProps {
  onClose: () => void;
}

const TeacherChatScreen: React.FC<TeacherChatScreenProps> = ({ onClose }) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const { currentConversation, isLoading, currentTeacher } = useSelector(
    (state: RootState) => state.spiritualTeacher
  );

  // Debug: Log current teacher when component mounts or teacher changes
  useEffect(() => {
    console.log('🎭 TeacherChat - Current teacher:', {
      id: currentTeacher?.id,
      name: currentTeacher?.name,
      displayName: currentTeacher?.displayName
    });
  }, [currentTeacher]);

  const [question, setQuestion] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [relatedTeachings, setRelatedTeachings] = useState<string[]>([]);
  const [suggestedPractice, setSuggestedPractice] = useState<string | null>(null);
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

  const getTeacherColor = () => {
    switch (currentTeacher?.id) {
      case 'osho':
        return '#FF6B35';
      case 'buddha':
        return '#FF9800';
      case 'krishnamurti':
        return '#9C27B0';
      case 'vivekananda':
        return '#FF5722';
      default:
        return brandColors.primary;
    }
  };

  const getTeacherInitial = () => {
    switch (currentTeacher?.id) {
      case 'osho':
        return 'O';
      case 'buddha':
        return 'B';
      case 'krishnamurti':
        return 'K';
      case 'vivekananda':
        return 'V';
      default:
        return 'T';
    }
  };

  const getTeacherGreeting = () => {
    switch (currentTeacher?.id) {
      case 'osho':
        return 'Ask Osho about meditation, awareness, love, and the celebration of life...';
      case 'buddha':
        return 'Ask Buddha about mindfulness, compassion, and the path to liberation...';
      case 'krishnamurti':
        return 'Ask Krishnamurti about freedom, awareness, and breaking conditioning...';
      case 'vivekananda':
        return 'Ask Vivekananda about strength, service, and self-realization...';
      default:
        return 'Ask your teacher about meditation, life, or spirituality...';
    }
  };

  const handleAskQuestion = async () => {
    if (!question.trim()) {
      Alert.alert('Please enter a question', `Ask ${currentTeacher?.displayName || 'your teacher'} anything about meditation, life, or spirituality.`);
      return;
    }

    if (isLoading) return;

    try {
      setIsTyping(true);
      const result = await dispatch(askSpiritualQuestion(question.trim()));
      
      console.log('Q&A Result:', result);
      
      if (result.type === 'spiritualTeacher/askQuestion/fulfilled') {
        setQuestion('');
        
        // Store AI-generated suggestions
        if (result.payload?.followUpQuestions?.length > 0) {
          setFollowUpQuestions(result.payload.followUpQuestions);
        }
        if (result.payload?.relatedTeachings?.length > 0) {
          setRelatedTeachings(result.payload.relatedTeachings);
        }
        if (result.payload?.practice) {
          setSuggestedPractice(result.payload.practice);
        }
      } else if (result.type === 'spiritualTeacher/askQuestion/rejected') {
        console.error('Q&A Error:', result.error);
        Alert.alert('Error', result.error?.message || 'Failed to get spiritual guidance. Please try again.');
      }
    } catch (error) {
      console.error('Q&A Exception:', error);
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
              backgroundColor: isUser ? getTeacherColor() : themeColors.card,
              borderColor: isUser ? getTeacherColor() : themeColors.border,
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
              {currentTeacher?.displayName || 'Teacher'} is thinking...
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

  const renderFollowUpQuestions = () => {
    if (followUpQuestions.length === 0) return null;

    return (
      <View style={[styles.suggestionContainer, { marginTop: 20 }]}>
        <Text style={[styles.suggestionTitle, { color: themeColors.textPrimary }]}>
          Continue exploring:
        </Text>
        {followUpQuestions.map((followUp, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.suggestionChip, { backgroundColor: themeColors.card }]}
            onPress={() => setQuestion(followUp)}
          >
            <Text style={[styles.suggestionText, { color: themeColors.textSecondary }]}>
              "{followUp}"
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderRelatedTeachings = () => {
    if (relatedTeachings.length === 0) return null;

    return (
      <View style={[styles.suggestionContainer, { marginTop: 20 }]}>
        <Text style={[styles.suggestionTitle, { color: themeColors.textPrimary }]}>
          Related teachings:
        </Text>
        {relatedTeachings.map((teaching, index) => (
          <View
            key={index}
            style={[styles.teachingChip, { backgroundColor: themeColors.card }]}
          >
            <Text style={[styles.teachingText, { color: themeColors.textSecondary }]}>
              {teaching}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const renderSuggestedPractice = () => {
    if (!suggestedPractice) return null;

    return (
      <View style={[styles.practiceContainer, { marginTop: 20 }]}>
        <Text style={[styles.practiceTitle, { color: themeColors.textPrimary }]}>
          Suggested practice:
        </Text>
        <View style={[styles.practiceChip, { backgroundColor: getTeacherColor() }]}>
          <FontAwesome name="play-circle" size={16} color="#FFFFFF" />
          <Text style={[styles.practiceText, { color: '#FFFFFF' }]}>
            {suggestedPractice}
          </Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <View style={[styles.teacherWelcome, { backgroundColor: getTeacherColor() }]}>
          <Text style={styles.teacherWelcomeText}>{getTeacherInitial()}</Text>
        </View>
        <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
          Chat with {currentTeacher?.displayName || 'Your Teacher'}
        </Text>
        <Text style={[styles.emptyStateDescription, { color: themeColors.textSecondary }]}>
          Get personalized spiritual guidance from {currentTeacher?.displayName || 'your teacher'}'s wisdom. Ask about meditation, love, awareness, or any aspect of your spiritual journey.
        </Text>
        
        <View style={styles.suggestionContainer}>
          <Text style={[styles.suggestionTitle, { color: themeColors.textPrimary }]}>
            Try asking:
          </Text>
          {[
            "Who are you?",
            "What is meditation?",
            "How can I find inner peace?",
            "What is the meaning of love?",
            "How do I deal with stress?"
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
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <StatusBar barStyle={themeColors.statusBarStyle || (themeColors.isDark ? 'light-content' : 'dark-content')} backgroundColor={themeColors.background} />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: themeColors.card, borderBottomColor: themeColors.border }]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={onClose} style={styles.backButton}>
              <FontAwesome name="arrow-left" size={20} color={themeColors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.teacherInfo}>
              <View style={[styles.teacherAvatar, { backgroundColor: getTeacherColor() }]}>
                <Text style={styles.teacherAvatarText}>{getTeacherInitial()}</Text>
              </View>
              <View>
                <Text style={[styles.teacherName, { color: themeColors.textPrimary }]}>
                  {currentTeacher?.displayName || 'Teacher'}
                </Text>
                <Text style={[styles.teacherStatus, { color: themeColors.textSecondary }]}>
                  Spiritual Teacher
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <FontAwesome name="times" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
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
              {renderFollowUpQuestions()}
              {renderRelatedTeachings()}
              {renderSuggestedPractice()}
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
              placeholder={getTeacherGreeting()}
              placeholderTextColor={themeColors.textSecondary}
              multiline
              maxLength={500}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                {
                  backgroundColor: question.trim() ? getTeacherColor() : themeColors.border,
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
  },
  teacherInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
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
    fontSize: 18,
    fontWeight: '600',
  },
  teacherStatus: {
    fontSize: 12,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 40,
    minHeight: 40,
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
  teacherWelcome: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  teacherWelcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
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
  teachingChip: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  teachingText: {
    fontSize: 14,
    textAlign: 'center',
  },
  practiceContainer: {
    width: '100%',
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 15,
    textAlign: 'center',
  },
  practiceChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '600',
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

export default TeacherChatScreen;
