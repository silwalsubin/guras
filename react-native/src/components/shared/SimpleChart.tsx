import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { RootState } from '@/store';

const { width } = Dimensions.get('window');

interface SimpleChartProps {
  data: number[];
  labels: string[];
  title: string;
  yAxisSuffix?: string;
  height?: number;
  type?: 'line' | 'bar';
}

const SimpleChart: React.FC<SimpleChartProps> = ({
  data,
  labels,
  title,
  yAxisSuffix = '',
  height = 200,
  type = 'bar',
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const maxValue = Math.max(...data);
  const chartWidth = width - 80; // Account for padding
  const barWidth = (chartWidth - (labels.length - 1) * 8) / labels.length; // 8px gap between bars

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
      
      <View style={[styles.chartContainer, { height }]}>
        {/* Y-axis labels */}
        <View style={styles.yAxisContainer}>
          <Text style={[styles.yAxisLabel, { color: themeColors.textSecondary }]}>
            {maxValue}{yAxisSuffix}
          </Text>
          <Text style={[styles.yAxisLabel, { color: themeColors.textSecondary }]}>
            {Math.round(maxValue * 0.5)}{yAxisSuffix}
          </Text>
          <Text style={[styles.yAxisLabel, { color: themeColors.textSecondary }]}>
            0{yAxisSuffix}
          </Text>
        </View>

        {/* Chart area */}
        <View style={styles.chartArea}>
          {/* Grid lines */}
          <View style={styles.gridContainer}>
            <View style={[styles.gridLine, { backgroundColor: themeColors.border }]} />
            <View style={[styles.gridLine, { backgroundColor: themeColors.border }]} />
            <View style={[styles.gridLine, { backgroundColor: themeColors.border }]} />
          </View>

          {/* Bars */}
          <View style={styles.barsContainer}>
            {data.map((value, index) => {
              const barHeight = maxValue > 0 ? (value / maxValue) * (height - 60) : 0;
              
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrapper}>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(barHeight, 2), // Minimum height for visibility
                          width: barWidth - 4,
                          backgroundColor: value > 0 ? brandColors.primary : themeColors.border,
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.xAxisLabel, { color: themeColors.textSecondary }]}>
                    {labels[index]}
                  </Text>
                  <Text style={[styles.valueLabel, { color: themeColors.textPrimary }]}>
                    {value}{yAxisSuffix}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
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
    marginBottom: 20,
    textAlign: 'center',
  },
  chartContainer: {
    flexDirection: 'row',
  },
  yAxisContainer: {
    width: 40,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
    paddingBottom: 40,
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartArea: {
    flex: 1,
    position: 'relative',
  },
  gridContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 40,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    width: '100%',
    opacity: 0.3,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: '100%',
    paddingBottom: 40,
  },
  barColumn: {
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    justifyContent: 'flex-end',
    alignItems: 'center',
    flex: 1,
    width: '100%',
  },
  bar: {
    borderRadius: 4,
    minHeight: 2,
  },
  xAxisLabel: {
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  valueLabel: {
    fontSize: 10,
    marginTop: 2,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default SimpleChart;
