import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import SimpleLineChart from './SimpleLineChart';
import { getThemeColors } from '@/config/colors';
import { RootState } from '@/store';

interface ProgressChartProps {
  type: 'line' | 'bar';
  data: number[];
  labels: string[];
  title: string;
  yAxisSuffix?: string;
  height?: number;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  type,
  data,
  labels,
  title,
  yAxisSuffix = '',
  height = 220,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);



  // Use our custom SimpleLineChart for line charts, fallback for bar charts
  if (type === 'line') {
    return (
      <SimpleLineChart
        data={data}
        labels={labels}
        title={title}
        yAxisSuffix={yAxisSuffix}
        height={height}
      />
    );
  }

  // For bar charts, show a simple fallback for now
  return (
    <View style={[styles.container, { backgroundColor: themeColors.card }]}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
      <View style={[styles.fallbackContainer, { borderColor: themeColors.border }]}>
        <Text style={[styles.fallbackText, { color: themeColors.textSecondary }]}>
          Bar Chart (Coming Soon)
        </Text>
        <Text style={[styles.fallbackSubtext, { color: themeColors.textSecondary }]}>
          Data: {data.join(', ')}{yAxisSuffix}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    overflow: 'hidden',
    borderRadius: 12,
  },
  chart: {
    borderRadius: 12,
  },
  fallbackContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
  },
  fallbackText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  fallbackSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
});

export default ProgressChart;
