import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { getThemeColors } from '@/config/colors';

interface MoreOptionsButtonProps {
  onPress: () => void;
  isDarkMode?: boolean;
  size?: number;
}

const MoreOptionsButton: React.FC<MoreOptionsButtonProps> = ({
  onPress,
  isDarkMode = false,
  size = 16,
}) => {
  const themeColors = getThemeColors(isDarkMode);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <FontAwesome 
        name="ellipsis-v" 
        size={size} 
        color={themeColors.textSecondary}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
});

export default MoreOptionsButton;
