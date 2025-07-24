import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';
import FontAwesome from 'react-native-vector-icons/FontAwesome5';
import { Vibration } from 'react-native';
import { getThemeColors } from '../config/colors';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { setActiveTab } from '../store/navigationSlice';

interface FooterMenuItemProps {
  tabKey: 'home' | 'meditate' | 'learn';
  iconName: string;
  iconType: 'feather' | 'fontawesome';
  solid?: boolean;
}

const FooterMenuItem: React.FC<FooterMenuItemProps> = ({
  tabKey,
  iconName,
  iconType,
  solid = false,
}) => {
  // You may want to pass isDarkMode as a prop for full theme support
  const themeColors = getThemeColors(false);
  const activeTab = useSelector((state: RootState) => state.navigation.activeTab);
  const dispatch = useDispatch();

  const isActive = activeTab === tabKey;

  const handlePress = () => {
    if (!isActive) {
      // Vibration.vibrate(0.1); // Feather light vibration
      dispatch(setActiveTab(tabKey));
    }
  };

  const iconColor = isActive ? themeColors.navActive : themeColors.navInactive;

  return (
    <TouchableOpacity
      style={[styles.navItem, isActive && styles.activeNavItem]}
      onPress={handlePress}
    >
      {iconType === 'feather' ? (
        <Feather name={iconName} size={24} color={iconColor} />
      ) : (
        <FontAwesome name={iconName} size={24} solid={solid} color={iconColor} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  activeNavItem: {
    // Add active styles if needed
  },
});

export default FooterMenuItem; 