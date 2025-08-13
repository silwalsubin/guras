import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';

interface LoveButtonProps {
  isLiked: boolean;
  likeCount: number;
  onPress: () => void;
  isDarkMode?: boolean;
  size?: number;
  showCount?: boolean;
}

const LoveButton: React.FC<LoveButtonProps> = ({
  isLiked,
  likeCount,
  onPress,
  isDarkMode = false,
  size = 24,
  showCount = true,
}) => {
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <FontAwesome 
          name="heart" 
          size={size} 
          color={isLiked ? "red" : themeColors.textSecondary} 
        />
      </TouchableOpacity>
      
      {showCount && (
        <Text style={[styles.likeCount, { color: themeColors.textSecondary }]}>
          {likeCount}
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
  likeCount: {
    ...TYPOGRAPHY.BODY_SMALL,
    marginLeft: 8,
  },
});

export default LoveButton;
