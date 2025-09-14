import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getThemeColors } from '@/config/colors';

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
  size = 20,
  showCount = true,
}) => {
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <MaterialIcons 
          name={isLiked ? "favorite" : "favorite-border"} 
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
    fontSize: 10,
    fontWeight: '400',
    marginLeft: 4,
  },
});

export default LoveButton;
