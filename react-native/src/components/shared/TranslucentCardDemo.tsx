import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors } from '@/config/colors';
import SemiTransparentCard from './SemiTransparentCard';
import TranslucentCard from './TranslucentCard';

const TranslucentCardDemo: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);

  return (
    <ScrollView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        Card Transparency Comparison
      </Text>
      
      <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>
        Scroll down to see the difference between transparent and translucent cards
      </Text>

      {/* Background pattern to demonstrate the effect */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternRow, { backgroundColor: themeColors.card }]}>
          <View style={[styles.patternItem, { backgroundColor: themeColors.primary }]} />
          <View style={[styles.patternItem, { backgroundColor: themeColors.secondary }]} />
          <View style={[styles.patternItem, { backgroundColor: themeColors.accent }]} />
        </View>
        <View style={[styles.patternRow, { backgroundColor: themeColors.secondary }]}>
          <View style={[styles.patternItem, { backgroundColor: themeColors.accent }]} />
          <View style={[styles.patternItem, { backgroundColor: themeColors.primary }]} />
          <View style={[styles.patternItem, { backgroundColor: themeColors.secondary }]} />
        </View>
      </View>

      {/* Old SemiTransparentCard */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          SemiTransparentCard (Old)
        </Text>
        <Text style={[styles.sectionDescription, { color: themeColors.textSecondary }]}>
          Uses rgba colors for transparency - background shows through but not blurred
        </Text>
        <SemiTransparentCard>
          <Text style={[styles.cardText, { color: themeColors.textPrimary }]}>
            This is the old SemiTransparentCard component. It uses rgba colors to create transparency, 
            allowing the background to show through but without any blur effect.
          </Text>
        </SemiTransparentCard>
      </View>

      {/* New TranslucentCard */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          TranslucentCard (New)
        </Text>
        <Text style={[styles.sectionDescription, { color: themeColors.textSecondary }]}>
          Uses BlurView for translucent effect - background is blurred for better readability
        </Text>
        <TranslucentCard>
          <Text style={[styles.cardText, { color: themeColors.textPrimary }]}>
            This is the new TranslucentCard component. It uses BlurView to create a translucent effect 
            where the background is blurred, making the content more readable while maintaining the 
            see-through aesthetic.
          </Text>
        </TranslucentCard>
      </View>

      {/* Custom blur amount */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Custom Blur Amount
        </Text>
        <Text style={[styles.sectionDescription, { color: themeColors.textSecondary }]}>
          You can customize the blur intensity for different effects
        </Text>
        <TranslucentCard blurAmount={40} intensity={0.6}>
          <Text style={[styles.cardText, { color: themeColors.textPrimary }]}>
            This card has a higher blur amount (40) and lower intensity (0.6), creating a more 
            pronounced blur effect with less opacity.
          </Text>
        </TranslucentCard>
      </View>

      {/* Light blur */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
          Light Blur
        </Text>
        <Text style={[styles.sectionDescription, { color: themeColors.textSecondary }]}>
          Subtle blur effect for minimal interference
        </Text>
        <TranslucentCard blurAmount={10} intensity={0.9}>
          <Text style={[styles.cardText, { color: themeColors.textPrimary }]}>
            This card has a light blur (10) and high intensity (0.9), creating a subtle blur 
            effect that barely interferes with the background.
          </Text>
        </TranslucentCard>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  backgroundPattern: {
    marginBottom: 32,
  },
  patternRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  patternItem: {
    flex: 1,
    height: 20,
    marginHorizontal: 4,
    borderRadius: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  cardText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default TranslucentCardDemo;
