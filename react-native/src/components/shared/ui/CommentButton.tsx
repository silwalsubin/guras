import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
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
        <FontAwesome 
          name="comment-o" 
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
    ...TYPOGRAPHY.CAPTION,
    marginLeft: 4,
  },
});

export default CommentButton;
