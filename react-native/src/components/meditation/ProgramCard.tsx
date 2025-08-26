import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { MeditationProgram } from '@/types/meditation';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface ProgramCardProps {
  program: MeditationProgram;
  onPress: (program: MeditationProgram) => void;
  style?: any;
}

const ProgramCard: React.FC<ProgramCardProps> = ({ program, onPress, style }) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const getProgressPercentage = () => {
    if (!program.isEnrolled || !program.completedDays) return 0;
    return (program.completedDays.length / program.duration) * 100;
  };

  const getThemeIcon = (theme: string) => {
    switch (theme) {
      case 'stress-relief': return 'heart';
      case 'sleep': return 'moon-o';
      case 'focus': return 'eye';
      case 'anxiety': return 'shield';
      case 'gratitude': return 'smile-o';
      case 'mindfulness': return 'leaf';
      default: return 'circle';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return '#4CAF50';
      case 'intermediate': return '#FF9800';
      case 'advanced': return '#F44336';
      default: return brandColors.primary;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: themeColors.card }, style]}
      onPress={() => onPress(program)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.themeIcon, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name={getThemeIcon(program.theme)} size={16} color={brandColors.primary} />
          </View>
          <View style={styles.titleText}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]} numberOfLines={2}>
              {program.title}
            </Text>
            <View style={styles.metaRow}>
              <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(program.difficulty) + '20' }]}>
                <Text style={[styles.difficultyText, { color: getDifficultyColor(program.difficulty) }]}>
                  {program.difficulty}
                </Text>
              </View>
              <Text style={[styles.duration, { color: themeColors.textSecondary }]}>
                {program.duration} days
              </Text>
            </View>
          </View>
        </View>
        
        {program.isEnrolled && (
          <View style={[styles.enrolledBadge, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="check-circle" size={12} color={brandColors.primary} />
            <Text style={[styles.enrolledText, { color: brandColors.primary }]}>
              Enrolled
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      <Text style={[styles.description, { color: themeColors.textSecondary }]} numberOfLines={2}>
        {program.description}
      </Text>

      {/* Progress (if enrolled) */}
      {program.isEnrolled && (
        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressLabel, { color: themeColors.textPrimary }]}>
              Progress
            </Text>
            <Text style={[styles.progressText, { color: brandColors.primary }]}>
              Day {program.currentDay}/{program.duration}
            </Text>
          </View>
          <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  backgroundColor: brandColors.primary,
                  width: `${getProgressPercentage()}%`
                }
              ]} 
            />
          </View>
        </View>
      )}

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Icon name="users" size={12} color={themeColors.textSecondary} />
          <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
            {program.totalParticipants.toLocaleString()}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="star" size={12} color={themeColors.textSecondary} />
          <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
            {program.rating.toFixed(1)}
          </Text>
        </View>
        <View style={styles.statItem}>
          <Icon name="user" size={12} color={themeColors.textSecondary} />
          <Text style={[styles.statText, { color: themeColors.textSecondary }]}>
            {program.teacher.name}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <View style={styles.actionContainer}>
        {program.isEnrolled ? (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: brandColors.primary }]}
            onPress={() => onPress(program)}
          >
            <Text style={[styles.actionButtonText, { color: 'white' }]}>
              Continue Program
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: 'transparent', borderColor: brandColors.primary, borderWidth: 1 }]}
            onPress={() => onPress(program)}
          >
            <Text style={[styles.actionButtonText, { color: brandColors.primary }]}>
              View Details
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  themeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleText: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginRight: 8,
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  duration: {
    fontSize: 12,
    fontWeight: '500',
  },
  enrolledBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  enrolledText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    fontSize: 12,
    marginLeft: 4,
  },
  actionContainer: {
    marginTop: 8,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProgramCard;
