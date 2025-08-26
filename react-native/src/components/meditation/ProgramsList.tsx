import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { enrollInProgram } from '@/store/guidedMeditationSlice';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { MeditationProgram } from '@/types/meditation';
import { mockMeditationPrograms } from '@/data/mockMeditationData';
import ProgramCard from './ProgramCard';
import ProgramDetailModal from './ProgramDetailModal';
import Icon from 'react-native-vector-icons/FontAwesome';

interface ProgramsListProps {
  showEnrolledOnly?: boolean;
  maxItems?: number;
  onProgramStart?: (program: MeditationProgram, day: number) => void;
}

const ProgramsList: React.FC<ProgramsListProps> = ({ 
  showEnrolledOnly = false, 
  maxItems,
  onProgramStart 
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [selectedProgram, setSelectedProgram] = useState<MeditationProgram | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const filteredPrograms = showEnrolledOnly 
    ? mockMeditationPrograms.filter(p => p.isEnrolled)
    : mockMeditationPrograms;

  const displayPrograms = maxItems 
    ? filteredPrograms.slice(0, maxItems)
    : filteredPrograms;

  const handleProgramPress = (program: MeditationProgram) => {
    setSelectedProgram(program);
    setModalVisible(true);
  };

  const handleEnroll = (program: MeditationProgram) => {
    console.log('Enrolling in program:', program.title);
    setModalVisible(false);

    // Dispatch enrollment action to Redux
    dispatch(enrollInProgram(program.id));

    // Mock enrollment - in real app this would be an API call
    const updatedProgram = {
      ...program,
      isEnrolled: true,
      currentDay: 1,
      completedDays: [],
    };

    // Update the program in the data (this is just for demo)
    const programIndex = mockMeditationPrograms.findIndex(p => p.id === program.id);
    if (programIndex !== -1) {
      mockMeditationPrograms[programIndex] = updatedProgram;
    }
  };

  const handleContinue = (program: MeditationProgram, day: number) => {
    console.log('Continuing program:', program.title, 'Day:', day);
    setModalVisible(false);
    
    if (onProgramStart) {
      onProgramStart(program, day);
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="calendar-o" size={48} color={themeColors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
        {showEnrolledOnly ? 'No Enrolled Programs' : 'No Programs Available'}
      </Text>
      <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
        {showEnrolledOnly 
          ? 'Enroll in a meditation program to start your journey'
          : 'Check back later for new meditation programs'
        }
      </Text>
    </View>
  );

  const renderSectionHeader = () => {
    if (showEnrolledOnly) {
      return (
        <View style={styles.sectionHeader}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="bookmark" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Your Programs
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
              Continue your meditation journey
            </Text>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.sectionHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="calendar" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
            Meditation Programs
          </Text>
          <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
            Structured challenges for lasting change
          </Text>
        </View>
      </View>
    );
  };

  const renderFilterTabs = () => {
    if (showEnrolledOnly) return null;

    const filters = [
      { key: 'all', label: 'All Programs', count: mockMeditationPrograms.length },
      { key: 'beginner', label: 'Beginner', count: mockMeditationPrograms.filter(p => p.difficulty === 'beginner').length },
      { key: 'intermediate', label: 'Intermediate', count: mockMeditationPrograms.filter(p => p.difficulty === 'intermediate').length },
      { key: '7-day', label: '7-Day', count: mockMeditationPrograms.filter(p => p.duration === 7).length },
      { key: '21-day', label: '21-Day', count: mockMeditationPrograms.filter(p => p.duration === 21).length },
      { key: '30-day', label: '30-Day', count: mockMeditationPrograms.filter(p => p.duration === 30).length },
    ];

    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {filters.map((filter) => (
          <TouchableOpacity
            key={filter.key}
            style={[
              styles.filterTab,
              { 
                backgroundColor: filter.key === 'all' ? brandColors.primary : themeColors.card,
                borderColor: filter.key === 'all' ? brandColors.primary : themeColors.border,
              }
            ]}
            onPress={() => {
              // TODO: Implement filtering
              console.log('Filter by:', filter.key);
            }}
          >
            <Text style={[
              styles.filterTabText,
              { 
                color: filter.key === 'all' ? 'white' : themeColors.textPrimary,
              }
            ]}>
              {filter.label}
            </Text>
            <Text style={[
              styles.filterTabCount,
              { 
                color: filter.key === 'all' ? 'white' : themeColors.textSecondary,
              }
            ]}>
              {filter.count}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  if (displayPrograms.length === 0) {
    return (
      <View style={styles.container}>
        {renderSectionHeader()}
        {renderEmptyState()}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderSectionHeader()}
      {renderFilterTabs()}
      
      <ScrollView 
        style={styles.programsList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {displayPrograms.map((program) => (
          <ProgramCard
            key={program.id}
            program={program}
            onPress={handleProgramPress}
          />
        ))}
        
        {maxItems && filteredPrograms.length > maxItems && (
          <TouchableOpacity style={styles.viewAllButton}>
            <Text style={[styles.viewAllText, { color: brandColors.primary }]}>
              View All Programs ({filteredPrograms.length - maxItems} more)
            </Text>
            <Icon name="chevron-right" size={12} color={brandColors.primary} />
          </TouchableOpacity>
        )}
      </ScrollView>

      <ProgramDetailModal
        visible={modalVisible}
        program={selectedProgram}
        onClose={() => setModalVisible(false)}
        onEnroll={handleEnroll}
        onContinue={handleContinue}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 14,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  filterTabCount: {
    fontSize: 10,
    fontWeight: '500',
  },
  programsList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default ProgramsList;
