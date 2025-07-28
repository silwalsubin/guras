import React, { useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import SignInScreen from '@/screens/sign-in';
import SignUpScreen from '@/screens/SignUpScreen';
import { TYPOGRAPHY } from '@/config/fonts';
import { COLORS } from '@/config/colors';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [authScreen, setAuthScreen] = useState<'signIn' | 'signUp'>('signIn');

  // Create a navigation object for auth screens
  const authNavigation = {
    navigate: (screen: 'SignUp' | 'SignIn') => {
      if (screen === 'SignUp') {
        setAuthScreen('signUp');
      } else if (screen === 'SignIn') {
        setAuthScreen('signIn');
      }
    },
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.PRIMARY} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    // Show authentication screens
    return (
      <View style={styles.authContainer}>
        {authScreen === 'signIn' ? (
          <SignInScreen navigation={authNavigation} />
        ) : (
          <SignUpScreen navigation={authNavigation} />
        )}
      </View>
    );
  }

  // User is authenticated, show the main app
  return <>{children}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.BACKGROUND_LIGHT,
  },
  loadingText: {
    marginTop: 16,
    ...TYPOGRAPHY.BODY,
    color: COLORS.TEXT_SECONDARY_LIGHT,
  },
  authContainer: {
    flex: 1,
  },
});

export default AuthWrapper; 