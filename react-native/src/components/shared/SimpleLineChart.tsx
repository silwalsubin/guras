import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { RootState } from '@/store';

const { width } = Dimensions.get('window');

interface SimpleLineChartProps {
  data: number[];
  labels: string[];
  title: string;
  yAxisSuffix?: string;
  height?: number;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  labels,
  title,
  yAxisSuffix = '',
  height = 200,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const chartWidth = width - 100; // Account for padding and y-axis
  const chartHeight = height - 60; // Account for title and x-axis labels

  // Calculate points for the line
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * chartWidth;
    const y = chartHeight - ((value - minValue) / (maxValue - minValue)) * chartHeight;
    return { x, y, value };
  });

  return (
    <View style={[styles.container, { backgroundColor: themeColors.cardBackground }]}>
      <Text style={[styles.title, { color: themeColors.textPrimary }]}>
        {title}
      </Text>
      
      <View style={styles.chartWrapper}>
        {/* Y-axis labels */}
        <View style={styles.yAxis}>
          <Text style={[styles.yAxisLabel, { color: themeColors.textSecondary }]}>
            {maxValue}{yAxisSuffix}
          </Text>
          <Text style={[styles.yAxisLabel, { color: themeColors.textSecondary }]}>
            {Math.round((maxValue + minValue) / 2)}{yAxisSuffix}
          </Text>
          <Text style={[styles.yAxisLabel, { color: themeColors.textSecondary }]}>
            {minValue}{yAxisSuffix}
          </Text>
        </View>

        {/* Chart area */}
        <View style={[styles.chartArea, { width: chartWidth, height: chartHeight }]}>
          {/* Grid lines */}
          <View style={styles.gridLines}>
            <View style={[styles.gridLine, { backgroundColor: themeColors.border }]} />
            <View style={[styles.gridLine, { backgroundColor: themeColors.border }]} />
            <View style={[styles.gridLine, { backgroundColor: themeColors.border }]} />
          </View>

          {/* Data points and line segments */}
          <View style={styles.lineContainer}>
            {points.map((point, index) => (
              <View key={index}>
                {/* Line segment to next point */}
                {index < points.length - 1 && (
                  <View
                    style={[
                      styles.lineSegment,
                      {
                        position: 'absolute',
                        left: point.x,
                        top: point.y,
                        width: Math.sqrt(
                          Math.pow(points[index + 1].x - point.x, 2) +
                          Math.pow(points[index + 1].y - point.y, 2)
                        ),
                        height: 2,
                        backgroundColor: brandColors.primary,
                        transform: [
                          {
                            rotate: `${Math.atan2(
                              points[index + 1].y - point.y,
                              points[index + 1].x - point.x
                            )}rad`,
                          },
                        ],
                        transformOrigin: '0 50%',
                      },
                    ]}
                  />
                )}
                
                {/* Data point */}
                <View
                  style={[
                    styles.dataPoint,
                    {
                      position: 'absolute',
                      left: point.x - 4,
                      top: point.y - 4,
                      backgroundColor: brandColors.primary,
                    },
                  ]}
                />
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* X-axis labels */}
      <View style={[styles.xAxis, { width: chartWidth, marginLeft: 50 }]}>
        {labels.map((label, index) => (
          <Text
            key={index}
            style={[
              styles.xAxisLabel,
              { color: themeColors.textSecondary },
              index === 0 && { textAlign: 'left' },
              index === labels.length - 1 && { textAlign: 'right' },
            ]}
          >
            {label}
          </Text>
        ))}
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
  chartWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  yAxis: {
    width: 50,
    height: 140, // chartHeight - adjust as needed
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 8,
  },
  yAxisLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  chartArea: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-between',
  },
  gridLine: {
    height: 1,
    width: '100%',
    opacity: 0.3,
  },
  lineContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  lineSegment: {
    backgroundColor: '#007AFF',
  },
  dataPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  xAxis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  xAxisLabel: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textAlign: 'center',
  },
});

export default SimpleLineChart;
