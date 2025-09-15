import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { setCurrentTeacher } from '../../store/spiritualTeacherSlice';
import { getThemeColors } from '../../config/colors';

interface TeacherSelectorProps {
  onTeacherSelect?: (teacherId: string) => void;
}

const TeacherSelector: React.FC<TeacherSelectorProps> = ({ onTeacherSelect }) => {
  const dispatch = useDispatch();
  const colors = getThemeColors();
  const { availableTeachers, currentTeacher } = useSelector((state: RootState) => state.spiritualTeacher);

  const handleTeacherSelect = (teacher: any) => {
    dispatch(setCurrentTeacher(teacher));
    onTeacherSelect?.(teacher.id);
  };

  const getTeacherIcon = (teacherId: string) => {
    switch (teacherId) {
      case 'osho':
        return '🧘‍♂️';
      case 'buddha':
        return '🕉️';
      default:
        return '👤';
    }
  };

  const getTeacherColor = (teacherId: string) => {
    switch (teacherId) {
      case 'osho':
        return '#FF6B35';
      case 'buddha':
        return '#FF9800';
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Choose Your Spiritual Teacher</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Select a teacher whose wisdom resonates with you
      </Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.teachersContainer}
      >
        {availableTeachers.map((teacher) => (
          <TouchableOpacity
            key={teacher.id}
            style={[
              styles.teacherCard,
              { 
                backgroundColor: colors.surface,
                borderColor: currentTeacher?.id === teacher.id ? getTeacherColor(teacher.id) : colors.border,
                borderWidth: currentTeacher?.id === teacher.id ? 2 : 1,
              }
            ]}
            onPress={() => handleTeacherSelect(teacher)}
          >
            <Text style={styles.teacherIcon}>{getTeacherIcon(teacher.id)}</Text>
            <Text style={[styles.teacherName, { color: colors.text }]}>
              {teacher.displayName}
            </Text>
            <Text style={[styles.teacherTitle, { color: colors.textSecondary }]}>
              {teacher.tradition.name}
            </Text>
            <Text style={[styles.teacherDescription, { color: colors.textSecondary }]}>
              {teacher.description}
            </Text>
            
            <View style={styles.teacherStats}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: getTeacherColor(teacher.id) }]}>
                  {teacher.popularity}/10
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Popularity</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: getTeacherColor(teacher.id) }]}>
                  {teacher.userRating}
                </Text>
                <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
              </View>
            </View>
            
            {currentTeacher?.id === teacher.id && (
              <View style={[styles.selectedIndicator, { backgroundColor: getTeacherColor(teacher.id) }]}>
                <Text style={styles.selectedText}>Selected</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 24,
  },
  teachersContainer: {
    paddingHorizontal: 10,
  },
  teacherCard: {
    width: 280,
    padding: 20,
    marginHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  teacherIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  teacherName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  teacherTitle: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  teacherDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  teacherStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default TeacherSelector;
