import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { PieChart } from 'react-native-svg-charts';
import { getBrandColors, getThemeColors } from '@/config/colors';
import { EmotionTriggerData } from '@/data/mockEmotionTriggersData';

interface EmotionDonutChartProps {
  emotions: EmotionTriggerData[];
  isDarkMode: boolean;
}

const EmotionDonutChart: React.FC<EmotionDonutChartProps> = ({
  emotions,
  isDarkMode,
}) => {
  const brandColors = getBrandColors();
  const themeColors = getThemeColors(isDarkMode);

  // Color palette for emotions
  const emotionColors: Record<string, string> = {
    Happy: '#10B981', // Primary green
    Anxious: '#F59E0B', // Warning amber
    Calm: '#3B82F6', // Info blue
    Sad: '#8B5CF6', // Purple
    Excited: '#EC4899', // Pink
    Angry: '#EF4444', // Error red
  };

  // Prepare chart data
  const chartData = useMemo(() => {
    return emotions.map((emotion, index) => {
      // Check if emotion has a color property (from API) or use hardcoded palette
      const emotionColor = (emotion as any).emotionColor || emotionColors[emotion.emotion] || brandColors.primary;

      return {
        key: `emotion-${emotion.emotion}-${index}`,
        value: emotion.frequency,
        svg: {
          fill: emotionColor,
        },
        emotion: emotion.emotion,
        frequency: emotion.frequency,
      };
    });
  }, [emotions, brandColors.primary]);

  const totalEmotions = emotions.length;

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <View
          style={[
            styles.chartContainer,
            {
              shadowColor: isDarkMode ? 'rgba(255,255,255,0.15)' : '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.4,
              shadowRadius: 32,
              elevation: 30,
            },
          ]}
        >
          <PieChart
            style={styles.chart}
            data={chartData}
            innerRadius="60%"
            outerRadius="100%"
            startAngle={0}
            endAngle={360}
          />
          {/* Center label overlay */}
          <View style={styles.centerLabel}>
            <Text
              style={[
                styles.centerLabelValue,
                { color: themeColors.textPrimary },
              ]}
            >
              {totalEmotions}
            </Text>
            <Text
              style={[
                styles.centerLabelText,
                { color: themeColors.textSecondary },
              ]}
            >
              Emotions
            </Text>
          </View>
        </View>
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        {emotions.map((emotion) => (
          <View key={emotion.emotion} style={styles.legendItem}>
            <View
              style={[
                styles.legendColor,
                {
                  backgroundColor:
                    emotionColors[emotion.emotion] || brandColors.primary,
                },
              ]}
            />
            <View style={styles.legendInfo}>
              <Text
                style={[
                  styles.legendLabel,
                  { color: themeColors.textPrimary },
                ]}
              >
                {emotion.emotion}
              </Text>
              <Text
                style={[
                  styles.legendValue,
                  { color: themeColors.textSecondary },
                ]}
              >
                {emotion.frequency}%
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  chartWrapper: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    width: '100%',
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  shadow3D: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.4,
    shadowRadius: 32,
    elevation: 30,
  },
  chart: {
    height: 240,
    width: '100%',
  },
  centerLabel: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  centerLabelValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  centerLabelText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  legend: {
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default EmotionDonutChart;

