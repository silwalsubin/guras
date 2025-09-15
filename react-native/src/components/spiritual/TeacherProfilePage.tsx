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
      {/* About Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {teacher.description || teacher.bio}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary, marginTop: 12 }]}>
          {teacher.id === 'osho' 
            ? "Osho (born Chandra Mohan Jain) was a controversial yet influential spiritual teacher, mystic, and philosopher who founded the Osho International Meditation Resort in Pune, India. Known for his dynamic meditation techniques and unconventional approach to spirituality, Osho combined Eastern philosophy with Western psychology to create a unique path of self-discovery. His teachings emphasized living life with joy, celebration, and awareness, challenging traditional religious and social norms. Osho developed over 100 meditation techniques, including the famous Dynamic Meditation, and wrote extensively on topics ranging from meditation and consciousness to love, relationships, and the nature of existence. Despite controversy surrounding his lifestyle and community, his teachings continue to inspire millions worldwide seeking personal transformation and spiritual growth."
            : "Buddha, also known as Siddhartha Gautama, was a spiritual teacher and founder of Buddhism, one of the world's major religions. Born into a royal family in ancient India, he renounced his privileged life at age 29 to seek the truth about human suffering. After six years of intense spiritual practice, he achieved enlightenment under the Bodhi tree at age 35. Buddha's teachings, known as the Dharma, center on the Four Noble Truths and the Eightfold Path, providing a practical framework for ending suffering and achieving liberation. He spent the next 45 years teaching across northern India, establishing a monastic community (Sangha) and spreading his message of compassion, mindfulness, and wisdom. Buddha's profound insights into the nature of existence, impermanence, and the path to enlightenment continue to guide millions of practitioners worldwide in their spiritual journey toward awakening and inner peace."
          }
        </Text>
      </View>

      {/* Biographical Information */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Biographical Information</Text>
        <View style={styles.bioInfo}>
          <View style={styles.bioItem}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Born</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'December 11, 1931' : 'c. 563 BCE'}
            </Text>
          </View>
          <View style={styles.bioItem}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Birth Place</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'Kuchwada, India' : 'Lumbini, Nepal'}
            </Text>
          </View>
          <View style={styles.bioItem}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Died</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'January 19, 1990' : 'c. 483 BCE'}
            </Text>
          </View>
          <View style={styles.bioItem}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Death Place</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'Pune, India' : 'Kushinagar, India'}
            </Text>
          </View>
          <View style={styles.bioItem}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Lifespan</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? '58 years' : '80 years'}
            </Text>
          </View>
        </View>
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
          <Text style={[styles.followersCount, { color: getTeacherColor() }]}>
            {teacher.followers?.toLocaleString() || '0'} Followers
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
    marginBottom: 8,
    textAlign: 'center',
    color: '#6B7280',
  },
  followersCount: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
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
  bioInfo: {
    marginTop: 12,
  },
  bioItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  bioValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
});

export default TeacherProfilePage;
