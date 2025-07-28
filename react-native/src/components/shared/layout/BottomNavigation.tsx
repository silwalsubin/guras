import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors } from '@/config/colors';
import { TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';
import FooterMenuItem from '@/components/FooterMenuItem';

const BottomNavigation: React.FC = () => {
  const insets = useSafeAreaInsets();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <View
      style={[
        styles.bottomNav,
        {
          backgroundColor: themeColors.card,
          borderTopColor: themeColors.border,
          paddingBottom: insets.bottom || 16,
        },
      ]}
    >
      <FooterMenuItem
        tabKey={TAB_KEYS.HOME}
        iconName="home"
        iconType="feather"
      />
      <FooterMenuItem
        tabKey={TAB_KEYS.AUDIO}
        iconName="compact-disc"
        iconType="fontawesome"
        solid
      />
      <FooterMenuItem
        tabKey={TAB_KEYS.LEARN}
        iconName="book-open"
        iconType="fontawesome"
        solid
      />
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)', // Will be overridden by theme
  },
});

export default BottomNavigation; 