import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { getThemeColors } from '@/config/colors';

interface ShareButtonProps {
  onPress: () => void;
  isDarkMode?: boolean;
  size?: number;
}

const ShareButton: React.FC<ShareButtonProps> = ({
  onPress,
  isDarkMode = false,
  size = 20,
}) => {
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress}>
        <MaterialIcons 
          name="send" 
          size={size} 
          color={themeColors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default ShareButton;
