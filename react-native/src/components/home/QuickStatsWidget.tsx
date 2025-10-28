import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface QuickStatsWidgetProps {
  totalMinutes?: number;
  totalSessions?: number;
  currentStreak?: number;
  nextMilestone?: {
    name: string;
    progress: number;
    target: number;
  };
}

const QuickStatsWidget: React.FC<QuickStatsWidgetProps> = ({
  totalMinutes = 0,
  totalSessions = 0,
  currentStreak = 0,
  nextMilestone,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const stats = [
    {
      icon: 'clock-o',
      label: 'Minutes',
      value: totalMinutes,
      color: brandColors.primary,
    },
    {
      icon: 'play-circle',
      label: 'Sessions',
      value: totalSessions,
      color: '#8B5CF6',
    },
    {
      icon: 'fire',
      label: 'Streak',
      value: currentStreak,
      color: '#FF6B6B',
    },
  ];

  const milestoneProgress = nextMilestone 
    ? Math.min((nextMilestone.progress / nextMilestone.target) * 100, 100)
    : 0;

  return (
    <View style={styles.container}>
      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        {stats.map((stat) => (
          <View key={stat.label} style={styles.statItem}>
            <View style={[styles.iconContainer, { backgroundColor: `${stat.color}15` }]}>
              <FontAwesome name={stat.icon} size={18} color={stat.color} />
            </View>
            <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
              {stat.value}
            </Text>
            <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
              {stat.label}
            </Text>
          </View>
        ))}
      </View>

      {/* Next Milestone */}
      {nextMilestone && (
        <View style={[
          styles.milestoneContainer,
          { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.02)' }
        ]}>
          <View style={styles.milestoneHeader}>
            <FontAwesome 
              name="target" 
              size={14} 
              color={brandColors.primary}
              style={styles.targetIcon}
            />
            <Text style={[styles.milestoneLabel, { color: themeColors.textSecondary }]}>
              Next Milestone
            </Text>
          </View>
          
          <Text style={[styles.milestoneName, { color: themeColors.textPrimary }]}>
            {nextMilestone.name}
          </Text>
          
          {/* Progress Bar */}
          <View style={[
            styles.progressBar,
            { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }
          ]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${milestoneProgress}%`,
                  backgroundColor: brandColors.primary,
                }
              ]}
            />
          </View>
          
          <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
            {nextMilestone.progress} / {nextMilestone.target}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statValue: {
    ...TYPOGRAPHY.HEADING_4,
    fontWeight: '700',
  },
  statLabel: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '500',
  },
  milestoneContainer: {
    borderRadius: 12,
    padding: 12,
    gap: 8,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  targetIcon: {
    marginRight: 2,
  },
  milestoneLabel: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '600',
  },
  milestoneName: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    ...TYPOGRAPHY.CAPTION,
    fontWeight: '500',
    textAlign: 'right',
  },
});

export default QuickStatsWidget;

