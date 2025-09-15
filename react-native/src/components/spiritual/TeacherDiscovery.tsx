import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { getThemeColors, getBrandColors } from '../../config/colors';
import { setCurrentTeacher } from '../../store/spiritualTeacherSlice';
import { Teacher } from '../../types/meditation';
import { SpiritualTeacher } from '../../types/spiritual';
import { mockTeachers } from '../../data/mockMeditationData';
import TeacherProfilePage from './TeacherProfilePage';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface TeacherDiscoveryProps {
  visible: boolean;
  onClose: () => void;
  onTeacherSelect: (teacher: SpiritualTeacher | Teacher) => void;
}

type TeacherType = 'all' | 'spiritual';
type SortBy = 'popularity' | 'rating' | 'name' | 'followers';

const TeacherDiscovery: React.FC<TeacherDiscoveryProps> = ({
  visible,
  onClose,
  onTeacherSelect,
}) => {
  const dispatch = useDispatch();
  const colors = getThemeColors();
  const brandColors = getBrandColors();
  
  const { availableTeachers } = useSelector((state: RootState) => state.spiritualTeacher);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<TeacherType>('all');
  const [sortBy, setSortBy] = useState<SortBy>('popularity');
  const [selectedTeacher, setSelectedTeacher] = useState<SpiritualTeacher | Teacher | null>(null);

  // Only spiritual teachers (Osho and Buddha)
  const allTeachers = useMemo(() => {
    return availableTeachers.map(teacher => ({
      ...teacher,
      type: 'spiritual' as const,
      followers: Math.floor(Math.random() * 10000) + 1000,
      rating: teacher.userRating,
      sessions: Math.floor(Math.random() * 100) + 20,
    }));
  }, [availableTeachers]);

  const filteredTeachers = useMemo(() => {
    let filtered = allTeachers.filter(teacher => {
      // Type filter
      if (selectedType !== 'all' && teacher.type !== selectedType) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          teacher.name.toLowerCase().includes(query) ||
          teacher.displayName?.toLowerCase().includes(query) ||
          teacher.description?.toLowerCase().includes(query) ||
          teacher.bio?.toLowerCase().includes(query) ||
          teacher.tradition?.name.toLowerCase().includes(query)
        );
      }
      
      return true;
    });

    // Sort teachers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.followers || 0) - (a.followers || 0);
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'name':
          return (a.displayName || a.name).localeCompare(b.displayName || b.name);
        case 'followers':
          return (b.followers || 0) - (a.followers || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allTeachers, searchQuery, selectedType, sortBy]);

  const getTeacherImage = (teacher: any) => {
    if (teacher.type === 'spiritual') {
      switch (teacher.id) {
        case 'osho':
          return require('../../../assets/teachers/osho.jpg');
        case 'buddha':
          return require('../../../assets/teachers/buddha.jpg');
        default:
          return null;
      }
    }
    return null;
  };

  const getTeacherColor = (teacher: any) => {
    if (teacher.type === 'spiritual') {
      switch (teacher.id) {
        case 'osho':
          return '#FF6B35';
        case 'buddha':
          return '#FF9800';
        default:
          return brandColors.primary;
      }
    }
    return brandColors.secondary;
  };

  const handleTeacherPress = (teacher: any) => {
    setSelectedTeacher(teacher);
  };

  const handleFollowTeacher = (teacher: any) => {
    if (teacher.type === 'spiritual') {
      dispatch(setCurrentTeacher(teacher));
    }
    onTeacherSelect(teacher);
    onClose();
  };

  const renderTeacherCard = (teacher: any) => (
    <TouchableOpacity
      key={`${teacher.type}-${teacher.id}`}
      style={[styles.teacherCard, { backgroundColor: colors.surface }]}
      onPress={() => handleTeacherPress(teacher)}
    >
      <View style={styles.teacherHeader}>
            <View style={[styles.teacherIcon, { backgroundColor: getTeacherColor(teacher) + '20' }]}>
              {getTeacherImage(teacher) ? (
                <Image
                  source={getTeacherImage(teacher)}
                  style={styles.teacherImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.teacherIconText}>👤</Text>
              )}
            </View>
        <View style={styles.teacherInfo}>
          <Text style={[styles.teacherName, { color: colors.text }]}>
            {teacher.displayName || teacher.name}
          </Text>
          <Text style={[styles.teacherTitle, { color: colors.textSecondary }]}>
            {teacher.tradition?.name || teacher.voiceStyle || 'Spiritual Teacher'}
          </Text>
          <Text style={[styles.teacherDescription, { color: colors.textSecondary }]}>
            {teacher.description || teacher.bio}
          </Text>
        </View>
        <View style={styles.teacherStats}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getTeacherColor(teacher) }]}>
              {teacher.followers?.toLocaleString() || '0'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getTeacherColor(teacher) }]}>
              {teacher.rating || 'N/A'}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.teacherTags}>
        <View style={[styles.typeTag, { backgroundColor: getTeacherColor(teacher) + '20' }]}>
          <Text style={[styles.typeTagText, { color: getTeacherColor(teacher) }]}>
            {teacher.type === 'spiritual' ? 'Spiritual' : 'Meditation'}
          </Text>
        </View>
        {teacher.specialties && teacher.specialties.slice(0, 2).map((specialty: string) => (
          <View key={specialty} style={[styles.specialtyTag, { backgroundColor: colors.background }]}>
            <Text style={[styles.specialtyTagText, { color: colors.textSecondary }]}>
              {specialty}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <FontAwesome name="search" size={16} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search teachers..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <FontAwesome name="times" size={16} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Type Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeFilter}>
          {[
            { key: 'all', label: 'All Teachers', icon: 'users' },
            { key: 'spiritual', label: 'Spiritual', icon: 'heart' },
          ].map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeChip,
              {
                backgroundColor: selectedType === type.key ? brandColors.primary : colors.surface,
                borderColor: selectedType === type.key ? brandColors.primary : colors.border,
              }
            ]}
            onPress={() => setSelectedType(type.key as TeacherType)}
          >
            <FontAwesome 
              name={type.icon as any} 
              size={12} 
              color={selectedType === type.key ? 'white' : colors.textSecondary} 
            />
            <Text style={[
              styles.typeChipText,
              { color: selectedType === type.key ? 'white' : colors.text }
            ]}>
              {type.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Sort Options */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortFilter}>
        {[
          { key: 'popularity', label: 'Most Popular', icon: 'fire' },
          { key: 'rating', label: 'Highest Rated', icon: 'star' },
          { key: 'followers', label: 'Most Followers', icon: 'users' },
          { key: 'name', label: 'Name', icon: 'sort-alpha-asc' },
        ].map((sort) => (
          <TouchableOpacity
            key={sort.key}
            style={[
              styles.sortChip,
              {
                backgroundColor: sortBy === sort.key ? brandColors.secondary : colors.surface,
                borderColor: sortBy === sort.key ? brandColors.secondary : colors.border,
              }
            ]}
            onPress={() => setSortBy(sort.key as SortBy)}
          >
            <FontAwesome 
              name={sort.icon as any} 
              size={12} 
              color={sortBy === sort.key ? 'white' : colors.textSecondary} 
            />
            <Text style={[
              styles.sortChipText,
              { color: sortBy === sort.key ? 'white' : colors.text }
            ]}>
              {sort.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderTeacherDetail = () => {
    if (!selectedTeacher) return null;

    return (
      <Modal
        visible={!!selectedTeacher}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedTeacher(null)}
      >
        <TeacherProfilePage
          teacher={selectedTeacher}
          onContentPress={(content) => {
            // TODO: Handle content press
            console.log('Content pressed:', content);
          }}
          onLearningPathPress={(path) => {
            // TODO: Handle learning path press
            console.log('Learning path pressed:', path);
          }}
          onBack={() => setSelectedTeacher(null)}
        />
      </Modal>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <FontAwesome name="times" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.text }]}>Discover Teachers</Text>
          <View style={styles.placeholder} />
        </View>

        {renderFilters()}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
            {filteredTeachers.length} teachers found
          </Text>
          
          {filteredTeachers.map(renderTeacherCard)}
        </ScrollView>

        {renderTeacherDetail()}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  placeholder: {
    width: 36,
  },
  filtersContainer: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    marginRight: 12,
    color: '#1A1A1A',
  },
  typeFilter: {
    marginBottom: 16,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  sortFilter: {
    marginBottom: 8,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
  },
  sortChipText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  resultsCount: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666666',
    fontWeight: '500',
  },
  teacherCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  teacherHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  teacherIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  teacherImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  teacherIconText: {
    fontSize: 28,
  },
  teacherInfo: {
    flex: 1,
    marginRight: 16,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1A1A1A',
  },
  teacherTitle: {
    fontSize: 15,
    marginBottom: 6,
    color: '#666666',
  },
  teacherDescription: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666666',
  },
  teacherStats: {
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
    color: '#666666',
    fontWeight: '500',
  },
  teacherTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  typeTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  typeTagText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  specialtyTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#F5F5F5',
  },
  specialtyTagText: {
    fontSize: 12,
    color: '#666666',
  },
  detailContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  detailContent: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FFFFFF',
  },
  teacherProfile: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    backgroundColor: '#FFF5F0',
  },
  profileIconText: {
    fontSize: 48,
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  profileTitle: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
    color: '#666666',
  },
  profileDescription: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    color: '#666666',
  },
  statsSection: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 32,
    backgroundColor: '#FAFAFA',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statCard: {
    alignItems: 'center',
    flex: 1,
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default TeacherDiscovery;
