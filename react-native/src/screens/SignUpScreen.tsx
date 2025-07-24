import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { TYPOGRAPHY } from '../config/fonts';
import { COLORS } from '../config/colors';

interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const validateForm = () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('SignIn'),
        },
      ]);
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🧘</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us on your meditation journey</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email"
                placeholderTextColor={COLORS.GRAY_400}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Create a password"
                placeholderTextColor={COLORS.GRAY_400}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
              <Text style={styles.hint}>Must be at least 6 characters</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm your password"
                placeholderTextColor={COLORS.GRAY_400}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity
              style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.WHITE} />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.signInLink}>Sign In</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    ...TYPOGRAPHY.H2,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 8,
  },
  subtitle: {
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY_LIGHT,
    textAlign: 'center',
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    ...TYPOGRAPHY.LABEL,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_PRIMARY_LIGHT,
    borderWidth: 1,
    borderColor: COLORS.GRAY_200,
  },
  hint: {
    ...TYPOGRAPHY.CAPTION,
    color: COLORS.GRAY_400,
    marginTop: 4,
    marginLeft: 4,
  },
  signUpButton: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonDisabled: {
    opacity: 0.7,
  },
  signUpButtonText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BUTTON_LARGE,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    color: COLORS.TEXT_SECONDARY_LIGHT,
    ...TYPOGRAPHY.BODY,
  },
  signInLink: {
    color: COLORS.PRIMARY,
    ...TYPOGRAPHY.BUTTON,
  },
});

export default SignUpScreen; 