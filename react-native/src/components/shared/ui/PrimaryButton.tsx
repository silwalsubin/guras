import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { getBrandColors, COLORS } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ 
  title, 
  onPress, 
  style,
  disabled = false 
}) => {
  const brandColors = getBrandColors();

  return (
    <TouchableOpacity 
      style={[
        styles.primaryButton, 
        { backgroundColor: disabled ? COLORS.GRAY_400 : brandColors.primary },
        style
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.buttonText, { color: COLORS.WHITE }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  primaryButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    ...TYPOGRAPHY.BUTTON,
  },
});

export default PrimaryButton; 