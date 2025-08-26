import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { MeditationProgram } from '@/types/meditation';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

interface ProgramDetailModalProps {
  visible: boolean;
  program: MeditationProgram | null;
  onClose: () => void;
  onEnroll?: (program: MeditationProgram) => void;
  onContinue?: (program: MeditationProgram, day: number) => void;
}

const ProgramDetailModal: React.FC<ProgramDetailModalProps> = ({
  visible,
  program,
  onClose,
  onEnroll,
  onContinue,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  if (!program) return null;

  const getProgressPercentage = () => {
    if (!program.isEnrolled || !program.completedDays) return 0;
    return (program.completedDays.length / program.duration) * 100;
  };

  const getDayStatus = (dayNumber: number) => {
    if (!program.isEnrolled) return 'locked';
    if (program.completedDays?.includes(dayNumber)) return 'completed';
    if (dayNumber === program.currentDay) return 'current';
    if (dayNumber < (program.currentDay || 1)) return 'available';
    return 'locked';
  };

  const getDayStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'check-circle';
      case 'current': return 'play-circle';
      case 'available': return 'circle-o';
      case 'locked': return 'lock';
      default: return 'circle-o';
    }
  };

  const getDayStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#4CAF50';
      case 'current': return brandColors.primary;
      case 'available': return themeColors.textSecondary;
      case 'locked': return themeColors.textSecondary;
      default: return themeColors.textSecondary;
    }
  };

  const renderDayItem = (dayNumber: number) => {
    const status = getDayStatus(dayNumber);
    const isInteractive = status === 'current' || status === 'available';

    return (
      <TouchableOpacity
        key={dayNumber}
        style={[
          styles.dayItem,
          { 
            backgroundColor: themeColors.card,
            borderColor: status === 'current' ? brandColors.primary : themeColors.border,
            borderWidth: status === 'current' ? 2 : 1,
          }
        ]}
        onPress={() => {
          if (isInteractive && onContinue) {
            onContinue(program, dayNumber);
          }
        }}
        disabled={!isInteractive}
        activeOpacity={isInteractive ? 0.7 : 1}
      >
        <View style={styles.dayHeader}>
          <View style={styles.dayNumber}>
            <Text style={[styles.dayNumberText, { color: themeColors.textPrimary }]}>
              {dayNumber}
            </Text>
          </View>
          <Icon 
            name={getDayStatusIcon(status)} 
            size={16} 
            color={getDayStatusColor(status)} 
          />
        </View>
        
        <Text style={[styles.dayTitle, { color: themeColors.textPrimary }]}>
          Day {dayNumber}: {getDayTitle(dayNumber)}
        </Text>
        
        <Text style={[styles.dayDescription, { color: themeColors.textSecondary }]}>
          {getDayDescription(dayNumber)}
        </Text>
        
        <View style={styles.dayMeta}>
          <Text style={[styles.dayDuration, { color: themeColors.textSecondary }]}>
            15 min
          </Text>
          {status === 'completed' && (
            <Text style={[styles.completedText, { color: '#4CAF50' }]}>
              Completed
            </Text>
          )}
          {status === 'current' && (
            <Text style={[styles.currentText, { color: brandColors.primary }]}>
              Start Today
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getDayTitle = (day: number) => {
    // Mock titles - in real app these would come from the program data
    const titles = [
      'Introduction to Mindfulness',
      'Breathing Awareness',
      'Body Scan Basics',
      'Observing Thoughts',
      'Loving Kindness',
      'Walking Meditation',
      'Reflection & Integration',
    ];
    return titles[(day - 1) % titles.length];
  };

  const getDayDescription = (day: number) => {
    // Mock descriptions - in real app these would come from the program data
    const descriptions = [
      'Learn the fundamentals of mindfulness practice',
      'Focus on breath awareness and concentration',
      'Develop body awareness through scanning',
      'Practice observing thoughts without judgment',
      'Cultivate compassion for self and others',
      'Bring mindfulness into movement',
      'Integrate your learning and plan ahead',
    ];
    return descriptions[(day - 1) % descriptions.length];
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Icon name="times" size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
            Program Details
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Program Info */}
          <View style={[styles.programInfo, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.programTitle, { color: themeColors.textPrimary }]}>
              {program.title}
            </Text>
            <Text style={[styles.programDescription, { color: themeColors.textSecondary }]}>
              {program.description}
            </Text>
            
            {/* Progress (if enrolled) */}
            {program.isEnrolled && (
              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={[styles.progressLabel, { color: themeColors.textPrimary }]}>
                    Your Progress
                  </Text>
                  <Text style={[styles.progressText, { color: brandColors.primary }]}>
                    {program.completedDays?.length || 0}/{program.duration} days
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

            {/* Benefits */}
            <View style={styles.benefitsSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                What You'll Gain
              </Text>
              {program.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Icon name="check" size={12} color={brandColors.primary} />
                  <Text style={[styles.benefitText, { color: themeColors.textSecondary }]}>
                    {benefit}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Daily Schedule */}
          <View style={styles.scheduleSection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Daily Schedule
            </Text>
            <View style={styles.daysList}>
              {Array.from({ length: program.duration }, (_, i) => i + 1).map(renderDayItem)}
            </View>
          </View>
        </ScrollView>

        {/* Action Button */}
        <View style={[styles.actionContainer, { backgroundColor: themeColors.background, borderTopColor: themeColors.border }]}>
          {program.isEnrolled ? (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: brandColors.primary }]}
              onPress={() => onContinue && onContinue(program, program.currentDay || 1)}
            >
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                Continue Day {program.currentDay}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: brandColors.primary }]}
              onPress={() => onEnroll && onEnroll(program)}
            >
              <Text style={[styles.actionButtonText, { color: 'white' }]}>
                Enroll in Program
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 36,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  programInfo: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  programTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  programDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  progressText: {
    fontSize: 14,
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
  benefitsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 14,
    marginLeft: 8,
    flex: 1,
  },
  scheduleSection: {
    marginBottom: 100,
  },
  daysList: {
    marginTop: 8,
  },
  dayItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  dayNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayNumberText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  dayDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  dayMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dayDuration: {
    fontSize: 12,
  },
  completedText: {
    fontSize: 12,
    fontWeight: '600',
  },
  currentText: {
    fontSize: 12,
    fontWeight: '600',
  },
  actionContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProgramDetailModal;
