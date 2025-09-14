import React, { useRef, useEffect } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getThemeColors, COLORS, colorUtils } from '@/config/colors';
import { TAB_KEYS } from '@/store/navigationSlice';
import { RootState } from '@/store';
import { showBottomNav } from '@/store/bottomNavSlice';
import FooterMenuItem from './components/FooterMenuItem';

const BottomNavigation: React.FC = () => {
  const dispatch = useDispatch();
  const insets = useSafeAreaInsets();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const isHidden = useSelector((state: RootState) => state.bottomNav.isHidden);
  const activeTab = useSelector((state: RootState) => state.navigation.activeTab);
  const themeColors = getThemeColors(isDarkMode);

  // Animation for hiding/showing
  const translateYAnim = useRef(new Animated.Value(0)).current;

  // Only apply auto-hide behavior on meditation screen
  const shouldHide = activeTab === TAB_KEYS.MEDITATION && isHidden;

  // Reset bottom nav state when switching away from meditation
  useEffect(() => {
    if (activeTab !== TAB_KEYS.MEDITATION) {
      dispatch(showBottomNav());
    }
  }, [activeTab, dispatch]);

  // Animate when visibility changes
  useEffect(() => {
    Animated.timing(translateYAnim, {
      toValue: shouldHide ? 100 : 0, // 100 = hidden, 0 = visible
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [shouldHide, translateYAnim]);

  return (
    <Animated.View
      style={[
        styles.bottomNav,
        {
          backgroundColor: isDarkMode
            ? colorUtils.withOpacity(COLORS.BLACK, 0.98) // Very blurry dark glass effect
            : colorUtils.withOpacity(COLORS.WHITE, 0.98), // Very blurry light glass effect
          borderTopColor: themeColors.border,
          paddingBottom: insets.bottom || 16,
          transform: [{ translateY: translateYAnim }],
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
        iconName="headphones"
        iconType="feather"
      />
      <FooterMenuItem
        tabKey={TAB_KEYS.MEDITATION}
        iconName="activity"
        iconType="feather"
      />
      <FooterMenuItem
        tabKey={TAB_KEYS.LEARN}
        iconName="book-open"
        iconType="fontawesome"
        solid
      />
      <FooterMenuItem
        tabKey={TAB_KEYS.PROFILE}
        iconName="user"
        iconType="feather"
      />
    </Animated.View>
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
    borderTopColor: colorUtils.withOpacity(COLORS.BLACK, 0.1), // Will be overridden by theme
    // Glass effect properties
    shadowColor: COLORS.BLACK,
    shadowOffset: {
      width: 0,
      height: -6,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 16, // Android shadow
  },
});

export default BottomNavigation; 