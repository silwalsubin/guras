import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors, COLORS } from '@/config/colors';
import { RootState } from '@/store';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileAvatarProps {
  size?: number;
  onPress?: () => void;
  showEditButton?: boolean;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({ 
  size = 80, 
  onPress,
  showEditButton = false 
}) => {
  const { user } = useAuth();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const hasProfilePicture = user?.photoURL && user.photoURL.length > 0;
  const displayName = user?.displayName || user?.email?.split('@')[0] || 'User';

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (showEditButton) {
      Alert.alert(
        'Edit Profile Picture',
        'Profile picture editing will be available soon!',
        [{ text: 'OK' }]
      );
    }
  };

  const avatarSize = size;
  const fontSize = Math.max(16, size * 0.5);

  if (hasProfilePicture) {
    return (
      <TouchableOpacity 
        style={styles.container} 
        onPress={handlePress}
        activeOpacity={onPress || showEditButton ? 0.7 : 1}
      >
        <Image
          source={{ uri: user.photoURL }}
          style={[
            styles.profileImage,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            }
          ]}
          resizeMode="cover"
        />
        {showEditButton && (
          <View style={[styles.editButton, { backgroundColor: brandColors.primary }]}>
            <Text style={styles.editButtonText}>✏️</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  }

  // Fallback to icon with user's initial or emoji
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={handlePress}
      activeOpacity={onPress || showEditButton ? 0.7 : 1}
    >
      <View 
        style={[
          styles.avatarPlaceholder, 
          { 
            backgroundColor: brandColors.primary,
            width: avatarSize,
            height: avatarSize,
            borderRadius: avatarSize / 2,
          }
        ]}
      >
        <Text style={[styles.avatarText, { fontSize }]}>
          {displayName.charAt(0).toUpperCase()}
        </Text>
      </View>
      {showEditButton && (
        <View style={[styles.editButton, { backgroundColor: brandColors.primary }]}>
          <Text style={styles.editButtonText}>✏️</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileImage: {
    borderWidth: 3,
    borderColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarText: {
    color: COLORS.WHITE,
    fontWeight: 'bold',
  },
  editButton: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.WHITE,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  editButtonText: {
    fontSize: 14,
    color: COLORS.WHITE,
  },
});

export default ProfileAvatar;
