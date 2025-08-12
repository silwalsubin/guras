import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';
import { useAuth } from '@/contexts/AuthContext';
import { TYPOGRAPHY } from '@/config/fonts';
import { COLORS } from '@/config/colors';

const GoogleSignInButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const { googleSignIn } = useAuth();

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      console.log('🔵 Google Sign In button pressed');
      
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const auth = getAuth();
      await signInWithCredential(auth, googleCredential);
      
      console.log('✅ Firebase Google auth successful, now syncing with server');
      
      // After Firebase auth succeeds, sync with your server
      await googleSignIn();
      
      console.log('✅ Google Sign In completed successfully');
    } catch (error: unknown) {
      console.error('❌ Google Sign In failed:', error);
      let message = 'Something went wrong.';
      if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: string }).message === 'string') {
        message = (error as { message: string }).message;
      }
      Alert.alert('Google Sign-In Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={signInWithGoogle} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={COLORS.WHITE} />
      ) : (
        <Text style={styles.buttonText}>Sign in with Google</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4', // Google brand color - keeping this specific
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BUTTON,
  },
});

export default GoogleSignInButton; 