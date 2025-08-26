import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { Teacher } from '@/types/meditation';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface TeacherCardProps {
  teacher: Teacher;
  onPress: (teacher: Teacher) => void;
  style?: any;
  compact?: boolean;
}

const TeacherCard: React.FC<TeacherCardProps> = ({ 
  teacher, 
  onPress, 
  style,
  compact = false 
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

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

  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, { backgroundColor: themeColors.card }, style]}
        onPress={() => onPress(teacher)}
        activeOpacity={0.7}
      >
        <View style={styles.compactContent}>
          {teacher.avatar ? (
            <Image source={{ uri: teacher.avatar }} style={styles.compactAvatar} />
          ) : (
            <View style={[styles.compactAvatarPlaceholder, { backgroundColor: brandColors.primary + '20' }]}>
              <Icon name="user" size={16} color={brandColors.primary} />
            </View>
          )}
          
          <View style={styles.compactInfo}>
            <Text style={[styles.compactName, { color: themeColors.textPrimary }]} numberOfLines={1}>
              {teacher.name}
            </Text>
            <Text style={[styles.compactStyle, { color: themeColors.textSecondary }]} numberOfLines={1}>
              {teacher.voiceStyle}
            </Text>
            <View style={styles.compactStats}>
              <View style={styles.compactStat}>
                <Icon name="star" size={10} color="#FFD700" />
                <Text style={[styles.compactStatText, { color: themeColors.textSecondary }]}>
                  {teacher.rating.toFixed(1)}
                </Text>
              </View>
              <View style={styles.compactStat}>
                <Icon name="play-circle" size={10} color={themeColors.textSecondary} />
                <Text style={[styles.compactStatText, { color: themeColors.textSecondary }]}>
                  {teacher.totalSessions}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: themeColors.card }, style]}
      onPress={() => onPress(teacher)}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        {teacher.avatar ? (
          <Image source={{ uri: teacher.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="user" size={24} color={brandColors.primary} />
          </View>
        )}
        
        <View style={styles.headerInfo}>
          <Text style={[styles.name, { color: themeColors.textPrimary }]}>
            {teacher.name}
          </Text>
          <Text style={[styles.voiceStyle, { color: themeColors.textSecondary }]}>
            {teacher.voiceStyle}
          </Text>
          <View style={styles.experience}>
            <Icon name="calendar" size={12} color={themeColors.textSecondary} />
            <Text style={[styles.experienceText, { color: themeColors.textSecondary }]}>
              {teacher.yearsExperience} years experience
            </Text>
          </View>
        </View>
      </View>

      {/* Bio */}
      <Text style={[styles.bio, { color: themeColors.textSecondary }]} numberOfLines={2}>
        {teacher.bio}
      </Text>

      {/* Specialties */}
      <View style={styles.specialtiesContainer}>
        <Text style={[styles.specialtiesLabel, { color: themeColors.textPrimary }]}>
          Specialties
        </Text>
        <View style={styles.specialties}>
          {teacher.specialties.slice(0, 3).map((specialty, index) => (
            <View 
              key={specialty}
              style={[
                styles.specialtyChip,
                { backgroundColor: getSpecialtyColor(specialty) + '20' }
              ]}
            >
              <Icon 
                name={getSpecialtyIcon(specialty)} 
                size={10} 
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
          {teacher.specialties.length > 3 && (
            <View style={[styles.moreChip, { backgroundColor: themeColors.border }]}>
              <Text style={[styles.moreText, { color: themeColors.textSecondary }]}>
                +{teacher.specialties.length - 3}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.stat}>
          <Icon name="star" size={14} color="#FFD700" />
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
            {teacher.rating.toFixed(1)}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Rating
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Icon name="play-circle" size={14} color={brandColors.primary} />
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
            {teacher.totalSessions}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Sessions
          </Text>
        </View>
        
        <View style={styles.stat}>
          <Icon name="graduation-cap" size={14} color={themeColors.textSecondary} />
          <Text style={[styles.statValue, { color: themeColors.textPrimary }]}>
            {teacher.yearsExperience}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Years
          </Text>
        </View>
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
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
  },
  voiceStyle: {
    fontSize: 14,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  experience: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  experienceText: {
    fontSize: 12,
    marginLeft: 4,
  },
  bio: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
  },
  specialtiesContainer: {
    marginBottom: 16,
  },
  specialtiesLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  specialtyText: {
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  moreChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  moreText: {
    fontSize: 10,
    fontWeight: '600',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  stat: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
  },
  // Compact styles
  compactContainer: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  compactAvatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  compactStyle: {
    fontSize: 12,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  compactStats: {
    flexDirection: 'row',
  },
  compactStat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  compactStatText: {
    fontSize: 10,
    marginLeft: 2,
  },
});

export default TeacherCard;
