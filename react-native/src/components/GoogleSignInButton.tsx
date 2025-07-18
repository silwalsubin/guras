import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { getAuth, GoogleAuthProvider, signInWithCredential } from '@react-native-firebase/auth';

const GoogleSignInButton: React.FC = () => {
  const [loading, setLoading] = React.useState(false);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const { idToken } = await GoogleSignin.getTokens();
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const auth = getAuth();
      await signInWithCredential(auth, googleCredential);
    } catch (error: any) {
      Alert.alert('Google Sign-In Error', error.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={signInWithGoogle} disabled={loading}>
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.buttonText}>Sign in with Google</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#4285F4',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoogleSignInButton; 