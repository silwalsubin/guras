import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { Teacher, GuidedMeditationSession, MeditationTheme } from '@/types/meditation';
import { mockTeachers } from '@/data/mockMeditationData';
import TeacherCard from './TeacherCard';
import TeacherDetailModal from './TeacherDetailModal';
import Icon from 'react-native-vector-icons/FontAwesome';

interface TeachersListProps {
  onSessionSelect?: (session: GuidedMeditationSession) => void;
  compact?: boolean;
  maxItems?: number;
  filterBySpecialty?: MeditationTheme;
}

const TeachersList: React.FC<TeachersListProps> = ({
  onSessionSelect,
  compact = false,
  maxItems,
  filterBySpecialty,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'experience' | 'sessions' | 'name'>('rating');

  const filteredAndSortedTeachers = useMemo(() => {
    const filtered = mockTeachers.filter(teacher => {
      // Specialty filter
      if (filterBySpecialty && !teacher.specialties.includes(filterBySpecialty)) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          teacher.name.toLowerCase().includes(query) ||
          teacher.bio.toLowerCase().includes(query) ||
          teacher.voiceStyle.toLowerCase().includes(query) ||
          teacher.specialties.some(specialty => specialty.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Sort teachers
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'experience':
        filtered.sort((a, b) => b.yearsExperience - a.yearsExperience);
        break;
      case 'sessions':
        filtered.sort((a, b) => b.totalSessions - a.totalSessions);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
    }

    return maxItems ? filtered.slice(0, maxItems) : filtered;
  }, [searchQuery, sortBy, filterBySpecialty, maxItems]);

  const handleTeacherPress = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setModalVisible(true);
  };

  const handleSessionSelect = (session: GuidedMeditationSession) => {
    if (onSessionSelect) {
      onSessionSelect(session);
    }
    setModalVisible(false);
  };

  const renderHeader = () => {
    if (compact) return null;

    return (
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="users" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Meditation Teachers
            </Text>
            <Text style={[styles.sectionSubtitle, { color: themeColors.textSecondary }]}>
              {filteredAndSortedTeachers.length} expert instructors
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderFilters = () => {
    if (compact) return null;

    return (
      <View style={styles.filtersContainer}>
        {/* Search */}
        <View style={[styles.searchContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <Icon name="search" size={16} color={themeColors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.textPrimary }]}
            placeholder="Search teachers..."
            placeholderTextColor={themeColors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="times" size={16} color={themeColors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Sort Options */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.sortContainer}
          contentContainerStyle={styles.sortContent}
        >
          {[
            { key: 'rating' as const, label: 'Highest Rated', icon: 'star' },
            { key: 'experience' as const, label: 'Most Experienced', icon: 'graduation-cap' },
            { key: 'sessions' as const, label: 'Most Sessions', icon: 'play-circle' },
            { key: 'name' as const, label: 'Name', icon: 'sort-alpha-asc' },
          ].map((option) => {
            const isSelected = sortBy === option.key;
            return (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortChip,
                  {
                    backgroundColor: isSelected ? brandColors.primary : themeColors.card,
                    borderColor: isSelected ? brandColors.primary : themeColors.border,
                  }
                ]}
                onPress={() => setSortBy(option.key)}
              >
                <Icon 
                  name={option.icon} 
                  size={12} 
                  color={isSelected ? 'white' : themeColors.textSecondary} 
                />
                <Text style={[
                  styles.sortChipText,
                  { color: isSelected ? 'white' : themeColors.textPrimary }
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="user-times" size={48} color={themeColors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
        No Teachers Found
      </Text>
      <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
        Try adjusting your search or filter criteria
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderFilters()}
      
      {filteredAndSortedTeachers.length > 0 ? (
        <ScrollView 
          style={styles.teachersList}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
        >
          {filteredAndSortedTeachers.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onPress={handleTeacherPress}
              compact={compact}
            />
          ))}
          
          {maxItems && mockTeachers.length > maxItems && (
            <TouchableOpacity style={styles.viewAllButton}>
              <Text style={[styles.viewAllText, { color: brandColors.primary }]}>
                View All Teachers ({mockTeachers.length - maxItems} more)
              </Text>
              <Icon name="chevron-right" size={12} color={brandColors.primary} />
            </TouchableOpacity>
          )}
        </ScrollView>
      ) : (
        renderEmptyState()
      )}

      <TeacherDetailModal
        visible={modalVisible}
        teacher={selectedTeacher}
        onClose={() => setModalVisible(false)}
        onSessionSelect={handleSessionSelect}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
  },
  sortContainer: {
    marginBottom: 8,
  },
  sortContent: {
    paddingRight: 16,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  sortChipText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
  teachersList: {
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

export default TeachersList;
