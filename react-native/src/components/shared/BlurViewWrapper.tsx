import React from 'react';
import { Platform, ViewStyle } from 'react-native';
import { BlurView } from '@react-native-community/blur';

interface BlurViewWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurType?: 'dark' | 'light' | 'xlight' | 'prominent' | 'ultraThinMaterial' | 'thinMaterial' | 'material' | 'thickMaterial' | 'chromeMaterial' | 'regularMaterial' | 'prominentMaterial' | 'systemMaterial' | 'systemChromeMaterial' | 'systemThickMaterial' | 'systemThinMaterial' | 'systemUltraThinMaterial' | 'systemLight' | 'systemDark' | 'systemGray' | 'systemGray2' | 'systemGray3' | 'systemGray4' | 'systemGray5' | 'systemGray6';
  blurAmount?: number;
  reducedTransparencyFallbackColor?: string;
}

const BlurViewWrapper: React.FC<BlurViewWrapperProps> = ({
  children,
  style,
  blurType = 'light',
  blurAmount = 20,
  reducedTransparencyFallbackColor,
}) => {
  // Only use BlurView on iOS
  if (Platform.OS === 'ios') {
    return (
      <BlurView
        style={style}
        blurType={blurType}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={reducedTransparencyFallbackColor}
      >
        {children}
      </BlurView>
    );
  }

  // For Android, return children without BlurView
  return <>{children}</>;
};

export default BlurViewWrapper;
