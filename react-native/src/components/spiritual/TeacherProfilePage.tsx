import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../../store';
import { getThemeColors, getBrandColors } from '../../config/colors';
import { followTeacher, unfollowTeacher, getTeacherFeed } from '../../store/teacherSlice';
import { setCurrentTeacher } from '../../store/spiritualTeacherSlice';
import { TeacherContent, TeacherLearningPath } from '../../types/teacher';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface TeacherProfilePageProps {
  teacher: any; // SpiritualTeacher or Teacher
  onContentPress: (content: TeacherContent) => void;
  onLearningPathPress: (path: TeacherLearningPath) => void;
  onBack: () => void;
}

type ContentTab = 'overview' | 'teachings' | 'practices' | 'sessions' | 'learning';

const TeacherProfilePage: React.FC<TeacherProfilePageProps> = ({
  teacher,
  onContentPress,
  onLearningPathPress,
  onBack,
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const colors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const insets = useSafeAreaInsets();
  
  const { followedTeachers, teacherFeeds, isLoading } = useSelector((state: RootState) => state.teacher);
  
  const [activeTab, setActiveTab] = useState<ContentTab>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const follow = followedTeachers.find(f => f.teacherId === teacher.id);
    setIsFollowing(!!follow);
  }, [followedTeachers, teacher.id]);

  const handleFollow = async () => {
    if (isFollowing) {
      await dispatch(unfollowTeacher(teacher.id));
    } else {
      await dispatch(followTeacher({
        teacherId: teacher.id,
        teacherType: teacher.type || 'spiritual'
      }));
      
      // If it's a spiritual teacher, also set as current teacher
      if (teacher.type === 'spiritual' || !teacher.type) {
        dispatch(setCurrentTeacher(teacher));
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await dispatch(getTeacherFeed(teacher.id));
    } finally {
      setRefreshing(false);
    }
  };

  const getTeacherImage = () => {
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

  const getTeacherColor = () => {
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


  const renderTabs = () => (
    <View style={[styles.tabBar, { backgroundColor: colors.card }]}>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabBarContent}
      >
        {[
          { key: 'overview', label: 'Overview', icon: 'info-circle' },
          { key: 'teachings', label: 'Teachings', icon: 'book' },
          { key: 'practices', label: 'Practices', icon: 'play-circle' },
          { key: 'sessions', label: 'Sessions', icon: 'headphones' },
          { key: 'learning', label: 'Learning', icon: 'graduation-cap' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.key ? getTeacherColor() : 'transparent',
              }
            ]}
            onPress={() => setActiveTab(tab.key as ContentTab)}
          >
            <FontAwesome
              name={tab.icon as any}
              size={14}
              color={activeTab === tab.key ? 'white' : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? 'white' : colors.textSecondary,
                }
              ]}
              numberOfLines={1}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      {/* Stats Row */}
      <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getTeacherColor() }]}>
            {teacher.followers?.toLocaleString() || '0'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Followers</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getTeacherColor() }]}>
            {teacher.rating || 'N/A'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Rating</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: getTeacherColor() }]}>
            {teacher.sessions || 'N/A'}
          </Text>
          <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Sessions</Text>
        </View>
      </View>

      {/* About Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {teacher.description || teacher.bio}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary, marginTop: 12 }]}>
          {teacher.id === 'osho' 
            ? "Osho was a spiritual teacher and mystic who founded the Osho International Meditation Resort in Pune, India. His teachings combine Eastern philosophy with Western psychology, emphasizing meditation, awareness, and living life with joy and celebration."
            : "Buddha, also known as Siddhartha Gautama, was a spiritual teacher and founder of Buddhism. His teachings focus on the Four Noble Truths, the Eightfold Path, and the practice of mindfulness and compassion to achieve enlightenment and end suffering."
          }
        </Text>
      </View>

      {/* Philosophy Section */}
      {teacher.philosophy && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Philosophy</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {teacher.philosophy.essence}
          </Text>
        </View>
      )}

      {/* Core Teachings */}
      {teacher.coreTeachings && (
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Core Teachings</Text>
          {teacher.coreTeachings.map((teaching: string, index: number) => (
            <View key={index} style={styles.teachingItem}>
              <Text style={styles.teachingNumber}>{index + 1}</Text>
              <Text style={[styles.teachingText, { color: colors.textPrimary }]}>{teaching}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'teachings':
        return renderTeachings();
      case 'practices':
        return renderPractices();
      case 'sessions':
        return renderSessions();
      case 'learning':
        return renderLearningPaths();
      default:
        return renderOverview();
    }
  };

  const renderTeachings = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Teachings content coming soon...
      </Text>
    </View>
  );

  const renderPractices = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Practices content coming soon...
      </Text>
    </View>
  );

  const renderSessions = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Sessions content coming soon...
      </Text>
    </View>
  );

  const renderLearningPaths = () => (
    <View style={styles.tabContent}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Learning paths coming soon...
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor="transparent" 
        translucent={true} 
      />
      
      {/* Background Profile Picture */}
      {getTeacherImage() && (
        <View style={styles.backgroundImageContainer}>
          <Image
            source={getTeacherImage()}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <View style={styles.backgroundOverlay} />
        </View>
      )}
      
      <View style={[styles.header, { backgroundColor: 'transparent', paddingTop: insets.top + 20, marginTop: 0 }]}>
        {onBack && (
          <TouchableOpacity style={[styles.backButton, { top: insets.top + 20 }]} onPress={onBack}>
            <FontAwesome name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        
        <View style={styles.headerContent}>
          <View style={[styles.teacherIcon, { backgroundColor: getTeacherColor() + '20' }]}>
            {getTeacherImage() ? (
              <Image
                source={getTeacherImage()}
                style={styles.teacherImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.teacherIconText}>👤</Text>
            )}
          </View>
          <Text style={[styles.teacherName, { color: colors.textPrimary }]}>
            {teacher.displayName || teacher.name}
          </Text>
          <Text style={[styles.teacherTitle, { color: colors.textSecondary }]}>
            {teacher.tradition?.name || teacher.voiceStyle || 'Spiritual Teacher'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.followButton, { top: insets.top + 20 }]}
          onPress={handleFollow}
        >
          <FontAwesome 
            name={isFollowing ? "check" : "plus"} 
            size={12} 
            color="#FFFFFF" 
          />
          <Text style={styles.followButtonText}>
            {isFollowing ? 'Following' : 'Follow'}
          </Text>
        </TouchableOpacity>
      </View>
      {renderTabs()}
      
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brandColors.primary}
          />
        }
      >
        {renderContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    marginTop: 0,
    paddingTop: 0,
  },
  backgroundImageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    zIndex: 0,
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    opacity: 0.4,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 300,
    backgroundColor: 'rgba(248, 250, 252, 0.7)',
    zIndex: 1,
  },
  header: {
    paddingBottom: 24,
    paddingHorizontal: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    padding: 8,
    zIndex: 1,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
  },
  teacherIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF7ED',
    overflow: 'hidden',
  },
  teacherImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  teacherIconText: {
    fontSize: 40,
  },
  teacherName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#1F2937',
  },
  teacherTitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    color: '#6B7280',
  },
  followButton: {
    position: 'absolute',
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F97316',
  },
  followButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
    color: '#FFFFFF',
  },
  tabBar: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingVertical: 12,
    zIndex: 2,
  },
  tabBarContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 80,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  tabContent: {
    padding: 20,
  },
  section: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1F2937',
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#F97316',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  teachingItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingVertical: 6,
  },
  teachingNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#F97316',
    marginRight: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  teachingText: {
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
    color: '#1F2937',
  },
  comingSoon: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 60,
    fontStyle: 'italic',
    color: '#999999',
  },
});

export default TeacherProfilePage;
