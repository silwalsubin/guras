import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';

interface CommentButtonProps {
  commentCount: number;
  onPress: () => void;
  isDarkMode?: boolean;
  size?: number;
  showCount?: boolean;
}

const CommentButton: React.FC<CommentButtonProps> = ({
  commentCount,
  onPress,
  isDarkMode = false,
  size = 20,
  showCount = true,
}) => {
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <MaterialIcons 
          name="chat-bubble-outline" 
          size={size} 
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>
      
      {showCount && (
        <Text style={[styles.commentCount, { color: themeColors.textSecondary }]}>
          {commentCount}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    fontSize: 10,
    fontWeight: '400',
    marginLeft: 4,
  },
});

export default CommentButton;
