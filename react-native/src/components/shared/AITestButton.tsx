import React, { useState } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  View,
  TextInput,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { apiService } from '@/services/api';

interface AITestButtonProps {
  onPress?: () => void;
}

const AITestButton: React.FC<AITestButtonProps> = ({ onPress }) => {
  const [isDarkMode] = useState(false); // You might want to get this from Redux
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<Array<{
    message: string;
    response: string;
    timestamp: string;
    processingTime: number;
  }>>([]);

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      setIsModalVisible(true);
    }
  };

  const testAIConnectivity = async () => {
    setIsLoading(true);
    try {
      console.log('🧪 Testing AI connectivity...');
      
      // Test ping first
      const pingResponse = await apiService.testAIPing();
      if (!pingResponse.success) {
        throw new Error('Server not responding');
      }
      console.log('✅ Ping successful:', pingResponse.data?.message);

      // Run detailed test
      const detailedResponse = await apiService.testAIDetailed();
      if (!detailedResponse.success) {
        throw new Error('Detailed test failed');
      }
      console.log('✅ Detailed test completed:', detailedResponse.data?.summary);

      const testData = detailedResponse.data;
      if (!testData) {
        throw new Error('No test data received');
      }

      // Build detailed error message
      let errorDetails = '';
      let hasErrors = false;

      testData.tests.forEach((test, index) => {
        if (test.status === 'ERROR' || test.status === 'FAIL') {
          hasErrors = true;
          errorDetails += `\n${index + 1}. ${test.test}: ${test.status}\n`;
          errorDetails += `   Details: ${test.details}\n`;
          if (test.errors && test.errors.length > 0) {
            errorDetails += `   Errors:\n`;
            test.errors.forEach(error => {
              errorDetails += `   - ${error}\n`;
            });
          }
          if (test.innerException) {
            errorDetails += `   Inner Exception: ${test.innerException}\n`;
          }
        }
      });

      // Display results
      const config = testData.configuration;
      const summary = testData.summary;
      
      const basicInfo = `🔑 API Key: ${config.apiKeyStatus} (${config.apiKeyLength} chars)\n` +
                       `🤖 Model: ${config.model}\n` +
                       `🌐 Base URL: ${config.baseUrl}\n` +
                       `📊 Tests: ${summary.passedTests}/${summary.totalTests} passed\n` +
                       `🎯 Overall: ${summary.overallStatus}`;

      if (hasErrors) {
        Alert.alert(
          'AI Test Results - Issues Found',
          basicInfo + '\n\n' + '❌ ERRORS FOUND:\n' + errorDetails,
          [
            { text: 'OK' },
            { text: 'View Full Details', onPress: () => showFullErrorDetails(testData) }
          ]
        );
      } else {
        Alert.alert(
          'AI Test Results - All Good!',
          basicInfo + '\n\n✅ All tests passed! You can now test AI chat.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ AI connectivity test failed:', error);
      Alert.alert(
        'AI Test Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nMake sure your server is running and OpenAI API key is configured.`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const showFullErrorDetails = (testData: any) => {
    let fullDetails = 'FULL TEST DETAILS:\n\n';
    
    testData.tests.forEach((test: any, index: number) => {
      fullDetails += `${index + 1}. ${test.test}\n`;
      fullDetails += `   Status: ${test.status}\n`;
      fullDetails += `   Details: ${test.details}\n`;
      
      if (test.errors && test.errors.length > 0) {
        fullDetails += `   Errors:\n`;
        test.errors.forEach((error: string) => {
          fullDetails += `   - ${error}\n`;
        });
      }
      
      if (test.innerException) {
        fullDetails += `   Inner Exception: ${test.innerException}\n`;
      }
      
      if (test.stackTrace) {
        fullDetails += `   Stack Trace: ${test.stackTrace}\n`;
      }
      
      fullDetails += '\n';
    });

    Alert.alert(
      'Full Error Details',
      fullDetails,
      [{ text: 'OK' }]
    );
  };

  const sendMessage = async () => {
    if (!message.trim()) {
      Alert.alert('Please enter a message');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🤖 Sending message to AI:', message);
      
      const response = await apiService.testAIChat(message.trim());
      
      if (response.success && response.data) {
        const newResponse = {
          message: message.trim(),
          response: response.data.response,
          timestamp: new Date().toLocaleTimeString(),
          processingTime: response.data.processingTimeMs
        };
        
        setResponses(prev => [newResponse, ...prev]);
        setMessage('');
        
        console.log('✅ AI response received:', {
          source: response.data.source,
          confidence: response.data.confidence,
          processingTime: response.data.processingTimeMs
        });
      } else {
        throw new Error(response.error?.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('❌ AI chat failed:', error);
      Alert.alert(
        'AI Chat Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setResponses([]);
    setMessage('');
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: brandColors.primary }]}
        onPress={handlePress}
        disabled={isLoading}
      >
        <Text style={styles.iconText}>🤖</Text>
        <Text style={styles.buttonText}>
          {isLoading ? 'Testing...' : 'Test AI'}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              AI Test Chat
            </Text>
            <TouchableOpacity
              onPress={() => setIsModalVisible(false)}
              style={styles.closeButton}
            >
              <Text style={[styles.closeIcon, { color: themeColors.textSecondary }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.testButtons}>
              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: brandColors.secondary }]}
                onPress={testAIConnectivity}
                disabled={isLoading}
              >
                <Text style={styles.testButtonIcon}>📡</Text>
                <Text style={styles.testButtonText}>
                  {isLoading ? 'Testing...' : 'Test Connectivity'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.testButton, { backgroundColor: themeColors.textSecondary }]}
                onPress={clearChat}
                disabled={isLoading}
              >
                <Text style={styles.testButtonIcon}>🗑️</Text>
                <Text style={styles.testButtonText}>Clear Chat</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.chatContainer} showsVerticalScrollIndicator={false}>
              {responses.length === 0 ? (
                <View style={styles.emptyState}>
                  <Text style={[styles.emptyIcon, { color: themeColors.textSecondary }]}>💬</Text>
                  <Text style={[styles.emptyText, { color: themeColors.textSecondary }]}>
                    Start a conversation with AI!
                  </Text>
                  <Text style={[styles.emptySubtext, { color: themeColors.textSecondary }]}>
                    Try asking: "What is meditation?" or "Tell me about mindfulness"
                  </Text>
                </View>
              ) : (
                responses.map((item, index) => (
                  <View key={index} style={styles.messageContainer}>
                    <View style={[styles.userMessage, { backgroundColor: brandColors.primary }]}>
                      <Text style={styles.messageText}>{item.message}</Text>
                      <Text style={styles.messageTime}>{item.timestamp}</Text>
                    </View>
                    <View style={[styles.aiMessage, { backgroundColor: themeColors.card }]}>
                      <Text style={[styles.messageText, { color: themeColors.textPrimary }]}>
                        {item.response}
                      </Text>
                      <Text style={[styles.messageTime, { color: themeColors.textSecondary }]}>
                        AI • {item.processingTime}ms
                      </Text>
                    </View>
                  </View>
                ))
              )}
            </ScrollView>

            <View style={[styles.inputContainer, { backgroundColor: themeColors.card, borderTopColor: themeColors.border }]}>
              <TextInput
                style={[styles.textInput, { color: themeColors.textPrimary, backgroundColor: themeColors.background }]}
                placeholder="Ask AI anything..."
                placeholderTextColor={themeColors.textSecondary}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={[styles.sendButton, { backgroundColor: brandColors.primary }]}
                onPress={sendMessage}
                disabled={isLoading || !message.trim()}
              >
                {isLoading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.sendIcon}>📤</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  iconText: {
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  closeIcon: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  testButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 12,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    flex: 1,
  },
  testButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  testButtonIcon: {
    fontSize: 16,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },
  messageContainer: {
    marginVertical: 8,
  },
  userMessage: {
    alignSelf: 'flex-end',
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    marginBottom: 4,
  },
  aiMessage: {
    alignSelf: 'flex-start',
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendIcon: {
    fontSize: 16,
  },
});

export default AITestButton;
