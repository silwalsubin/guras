import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { TYPOGRAPHY } from '@/config/fonts';
import { COLORS } from '@/config/colors';

interface SignOutButtonProps {
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ style, textStyle }) => {
  const { signOut } = useAuth();
  const [loading, setLoading] = React.useState<boolean>(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await signOut();
            } catch {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handleSignOut}
      disabled={loading}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.WHITE} size="small" />
      ) : (
        <Text style={[styles.buttonText, textStyle]}>Sign Out</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.ERROR,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  buttonText: {
    color: COLORS.WHITE,
    ...TYPOGRAPHY.BUTTON,
  },
});

export default SignOutButton; 