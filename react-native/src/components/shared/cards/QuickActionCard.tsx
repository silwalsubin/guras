import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';

const { width } = Dimensions.get('window');

interface QuickActionCardProps {
  icon: string;
  title: string;
  onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ 
  icon, 
  title, 
  onPress
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <TouchableOpacity 
      style={[styles.quickActionCard, { backgroundColor: themeColors.card }]}
      onPress={onPress}
    >
      <Text style={styles.quickActionIcon}>{icon}</Text>
      <Text style={[styles.quickActionTitle, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  quickActionCard: {
    width: (width - 60) / 2,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  quickActionTitle: {
    ...TYPOGRAPHY.BUTTON_SMALL,
    textAlign: 'center',
  },
});

export default QuickActionCard; 