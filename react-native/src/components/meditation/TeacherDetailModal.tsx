import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { Teacher, GuidedMeditationSession } from '@/types/meditation';
import { mockGuidedSessions } from '@/data/mockMeditationData';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width, height } = Dimensions.get('window');

interface TeacherDetailModalProps {
  visible: boolean;
  teacher: Teacher | null;
  onClose: () => void;
  onSessionSelect: (session: GuidedMeditationSession) => void;
}

const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  visible,
  teacher,
  onClose,
  onSessionSelect,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const teacherSessions = useMemo(() => {
    if (!teacher) return [];
    return mockGuidedSessions.filter(session => session.teacher.id === teacher.id);
  }, [teacher]);

  if (!teacher) return null;

  const getSpecialtyIcon = (specialty: string) => {
    switch (specialty) {
      case 'stress-relief': return 'heart';
      case 'sleep': return 'moon-o';
      case 'focus': return 'eye';
      case 'anxiety': return 'shield';
      case 'gratitude': return 'smile-o';
      case 'mindfulness': return 'leaf';
      case 'compassion': return 'heart-o';
      case 'body-scan': return 'user-o';
      default: return 'circle';
    }
  };

  const getSpecialtyColor = (specialty: string) => {
    switch (specialty) {
      case 'stress-relief': return '#FF6B6B';
      case 'sleep': return '#4ECDC4';
      case 'focus': return '#45B7D1';
      case 'anxiety': return '#96CEB4';
      case 'gratitude': return '#FFEAA7';
      case 'mindfulness': return '#DDA0DD';
      case 'compassion': return '#FFB6C1';
      case 'body-scan': return '#98D8C8';
      default: return brandColors.primary;
    }
  };

  const renderSessionCard = (session: GuidedMeditationSession) => (
    <TouchableOpacity
      key={session.id}
      style={[styles.sessionCard, { backgroundColor: themeColors.card }]}
      onPress={() => {
        onSessionSelect(session);
        onClose();
      }}
      activeOpacity={0.7}
    >
      <View style={styles.sessionHeader}>
        <View style={[
          styles.sessionThemeIcon,
          { backgroundColor: getSpecialtyColor(session.theme) + '20' }
        ]}>
          <Icon 
            name={getSpecialtyIcon(session.theme)} 
            size={14} 
            color={getSpecialtyColor(session.theme)} 
          />
        </View>
        <View style={styles.sessionBadges}>
          {session.isNew && (
            <View style={[styles.newBadge, { backgroundColor: '#FF6B6B' }]}>
              <Text style={styles.newBadgeText}>NEW</Text>
            </View>
          )}
          {session.isFeatured && (
            <View style={[styles.featuredBadge, { backgroundColor: '#FFD700' }]}>
              <Icon name="star" size={8} color="white" />
            </View>
          )}
        </View>
      </View>

      <Text style={[styles.sessionTitle, { color: themeColors.textPrimary }]} numberOfLines={2}>
        {session.title}
      </Text>
      
      <Text style={[styles.sessionDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
        {session.description}
      </Text>

      <View style={styles.sessionMeta}>
        <Text style={[styles.sessionDuration, { color: brandColors.primary }]}>
          {session.duration} min
        </Text>
        <View style={styles.sessionRating}>
          <Icon name="star" size={10} color="#FFD700" />
          <Text style={[styles.sessionRatingText, { color: themeColors.textSecondary }]}>
            {session.rating.toFixed(1)}
          </Text>
        </View>
        <Text style={[styles.sessionTheme, { color: themeColors.textSecondary }]}>
          {session.theme.replace('-', ' ')}
        </Text>
      </View>
    </TouchableOpacity>
  );

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
            Teacher Profile
          </Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Teacher Info */}
          <View style={[styles.teacherInfo, { backgroundColor: themeColors.card }]}>
            <View style={styles.teacherHeader}>
              {teacher.avatar ? (
                <Image source={{ uri: teacher.avatar }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, { backgroundColor: brandColors.primary + '20' }]}>
                  <Icon name="user" size={32} color={brandColors.primary} />
                </View>
              )}
              
              <View style={styles.teacherDetails}>
                <Text style={[styles.teacherName, { color: themeColors.textPrimary }]}>
                  {teacher.name}
                </Text>
                <Text style={[styles.voiceStyle, { color: themeColors.textSecondary }]}>
                  {teacher.voiceStyle}
                </Text>
                <View style={styles.experience}>
                  <Icon name="calendar" size={12} color={themeColors.textSecondary} />
                  <Text style={[styles.experienceText, { color: themeColors.textSecondary }]}>
                    {teacher.yearsExperience} years of experience
                  </Text>
                </View>
              </View>
            </View>

            <Text style={[styles.bio, { color: themeColors.textSecondary }]}>
              {teacher.bio}
            </Text>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Icon name="star" size={16} color="#FFD700" />
                <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                  {teacher.rating.toFixed(1)}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                  Rating
                </Text>
              </View>
              
              <View style={styles.stat}>
                <Icon name="play-circle" size={16} color={brandColors.primary} />
                <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                  {teacher.totalSessions}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                  Sessions
                </Text>
              </View>
              
              <View style={styles.stat}>
                <Icon name="users" size={16} color={themeColors.textSecondary} />
                <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
                  {teacherSessions.reduce((sum, session) => sum + session.completionCount, 0).toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
                  Completions
                </Text>
              </View>
            </View>

            {/* Specialties */}
            <View style={styles.specialtiesSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                Specialties
              </Text>
              <View style={styles.specialties}>
                {teacher.specialties.map((specialty) => (
                  <View 
                    key={specialty}
                    style={[
                      styles.specialtyChip,
                      { backgroundColor: getSpecialtyColor(specialty) + '20' }
                    ]}
                  >
                    <Icon 
                      name={getSpecialtyIcon(specialty)} 
                      size={12} 
                      color={getSpecialtyColor(specialty)} 
                    />
                    <Text style={[
                      styles.specialtyText,
                      { color: getSpecialtyColor(specialty) }
                    ]}>
                      {specialty.replace('-', ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>

          {/* Sessions */}
          <View style={styles.sessionsSection}>
            <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
              Sessions by {teacher.name} ({teacherSessions.length})
            </Text>
            
            {teacherSessions.length > 0 ? (
              <View style={styles.sessionsList}>
                {teacherSessions.map(renderSessionCard)}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Icon name="music" size={48} color={themeColors.textSecondary} />
                <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
                  No Sessions Available
                </Text>
                <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
                  This teacher doesn't have any sessions available yet.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
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
  teacherInfo: {
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  teacherHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  teacherDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  teacherName: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 4,
  },
  voiceStyle: {
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  experience: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 14,
    marginLeft: 4,
  },
  bio: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    marginBottom: 20,
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  specialtiesSection: {
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  specialtyText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textTransform: 'capitalize',
  },
  sessionsSection: {
    marginBottom: 100,
  },
  sessionsList: {
    marginTop: 8,
  },
  sessionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  sessionThemeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sessionBadges: {
    flexDirection: 'row',
  },
  newBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  newBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'white',
  },
  featuredBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
  },
  sessionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 22,
  },
  sessionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  sessionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionDuration: {
    fontSize: 12,
    fontWeight: '600',
  },
  sessionRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionRatingText: {
    fontSize: 12,
    marginLeft: 2,
  },
  sessionTheme: {
    fontSize: 12,
    textTransform: 'capitalize',
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

export default TeacherDetailModal;
