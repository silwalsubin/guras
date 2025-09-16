import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
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
  
  // Scroll animation
  const scrollY = useRef(new Animated.Value(0)).current;
  const HEADER_MAX_HEIGHT = 280;
  const HEADER_MIN_HEIGHT = 120;
  const HEADER_SCROLL_DISTANCE = 80; // Reduced from 160 to make header compact easier

  // Animated values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: 'clamp',
  });

  const profileImageSize = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [80, 36],
    extrapolate: 'clamp',
  });

  const profileImageBorderRadius = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [40, 18],
    extrapolate: 'clamp',
  });

  const titleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.3, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const subtitleOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.3, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

  const followersOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE * 0.3, HEADER_SCROLL_DISTANCE],
    outputRange: [1, 1, 0],
    extrapolate: 'clamp',
  });

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
    // First check if teacher object has image data passed from parent
    if (teacher.image) {
      return teacher.image;
    }
    
    // Fallback to hardcoded images based on teacher ID
    if (teacher.type === 'spiritual') {
      switch (teacher.id) {
        case 'osho':
          return require('../../../assets/teachers/osho.jpg');
        case 'buddha':
          return require('../../../assets/teachers/buddha.jpg');
        case 'krishnamurti':
          return require('../../../assets/teachers/jkrishnamurti.jpg');
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
    <View style={[styles.tabBar, { 
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    }]}>
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
    <View style={styles.contentContainer}>
      {/* About Section */}
      <View style={[styles.fullWidthSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>About</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {teacher.description || teacher.bio}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary, marginTop: 12 }]}>
          {teacher.id === 'osho' 
            ? "Osho (born Chandra Mohan Jain) was a controversial yet influential spiritual teacher, mystic, and philosopher who founded the Osho International Meditation Resort in Pune, India. Known for his dynamic meditation techniques and unconventional approach to spirituality, Osho combined Eastern philosophy with Western psychology to create a unique path of self-discovery. His teachings emphasized living life with joy, celebration, and awareness, challenging traditional religious and social norms. Osho developed over 100 meditation techniques, including the famous Dynamic Meditation, and wrote extensively on topics ranging from meditation and consciousness to love, relationships, and the nature of existence. Despite controversy surrounding his lifestyle and community, his teachings continue to inspire millions worldwide seeking personal transformation and spiritual growth."
            : teacher.id === 'buddha' 
            ? "Buddha, also known as Siddhartha Gautama, was a spiritual teacher and founder of Buddhism, one of the world's major religions. Born into a royal family in ancient India, he renounced his privileged life at age 29 to seek the truth about human suffering. After six years of intense spiritual practice, he achieved enlightenment under the Bodhi tree at age 35. Buddha's teachings, known as the Dharma, center on the Four Noble Truths and the Eightfold Path, providing a practical framework for ending suffering and achieving liberation. He spent the next 45 years teaching across northern India, establishing a monastic community (Sangha) and spreading his message of compassion, mindfulness, and wisdom. Buddha's profound insights into the nature of existence, impermanence, and the path to enlightenment continue to guide millions of practitioners worldwide in their spiritual journey toward awakening and inner peace."
            : teacher.id === 'vivekananda'
            ? "Swami Vivekananda (born Narendranath Datta) was a Hindu monk and philosopher who introduced Vedanta to the Western world. A disciple of Sri Ramakrishna, he founded the Ramakrishna Mission and delivered the famous speech at the Parliament of World Religions in Chicago in 1893, beginning with 'Sisters and Brothers of America.' He emphasized the divinity of man, self-confidence, and service to humanity as the highest form of worship. Vivekananda's teachings focused on practical spirituality through the four paths of yoga: Karma Yoga (selfless service), Bhakti Yoga (devotion), Jnana Yoga (knowledge), and Raja Yoga (meditation). He believed that education should manifest the perfection already in man and that all religions are valid paths to the same truth. His inspiring message of self-confidence and service continues to motivate millions worldwide in their spiritual and social development."
            : "Jiddu Krishnamurti was a philosopher, speaker, and writer who questioned the very nature of thought, consciousness, and freedom. Born in India and raised by the Theosophical Society, he later rejected all organized religion and spiritual authority, including the role they had prepared for him as the 'World Teacher.' Instead, he dedicated his life to exploring the nature of consciousness and human conditioning through direct inquiry and dialogue. His teachings emphasized the importance of self-inquiry, observation without the observer, and freedom from psychological conditioning. Krishnamurti's approach was unique in that he refused to establish any system, method, or following, insisting that truth is a pathless land that each individual must discover for themselves through their own investigation and awareness."
          }
        </Text>
      </View>

      {/* Biographical Information */}
      <View style={[styles.fullWidthSection, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Biographical Information</Text>
        <View style={styles.bioInfo}>
          <View style={[styles.bioItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Born</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'December 11, 1931' : 
               teacher.id === 'buddha' ? 'c. 563 BCE' : 
               teacher.id === 'vivekananda' ? 'January 12, 1863' :
               'May 12, 1895'}
            </Text>
          </View>
          <View style={[styles.bioItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Birth Place</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'Kuchwada, India' : 
               teacher.id === 'buddha' ? 'Lumbini, Nepal' : 
               teacher.id === 'vivekananda' ? 'Calcutta, India' :
               'Madanapalle, India'}
            </Text>
          </View>
          <View style={[styles.bioItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Died</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'January 19, 1990' : 
               teacher.id === 'buddha' ? 'c. 483 BCE' : 
               teacher.id === 'vivekananda' ? 'July 4, 1902' :
               'February 17, 1986'}
            </Text>
          </View>
          <View style={[styles.bioItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Death Place</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? 'Pune, India' : 
               teacher.id === 'buddha' ? 'Kushinagar, India' : 
               teacher.id === 'vivekananda' ? 'Belur, India' :
               'Ojai, California, USA'}
            </Text>
          </View>
          <View style={[styles.bioItem, { borderBottomColor: colors.border }]}>
            <Text style={[styles.bioLabel, { color: colors.textSecondary }]}>Lifespan</Text>
            <Text style={[styles.bioValue, { color: colors.textPrimary }]}>
              {teacher.id === 'osho' ? '58 years' : 
               teacher.id === 'buddha' ? '80 years' : 
               teacher.id === 'vivekananda' ? '39 years' :
               '90 years'}
            </Text>
          </View>
        </View>
      </View>

      {/* Philosophy Section */}
      {teacher.philosophy && (
        <View style={[styles.fullWidthSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Philosophy</Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {teacher.philosophy.essence}
          </Text>
        </View>
      )}

      {/* Core Teachings */}
      {teacher.coreTeachings && (
        <View style={[styles.fullWidthSection, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Core Teachings</Text>
          {teacher.coreTeachings.map((teaching: string, index: number) => (
            <View key={index} style={styles.teachingItem}>
              <Text style={styles.teachingNumber}>{index + 1}</Text>
              <Text style={[styles.teachingText, { color: colors.textPrimary }]}>{teaching}</Text>
            </View>
          ))}
        </View>
      )}
      
      {/* Spacer at bottom to allow scrolling up */}
      <View style={styles.topSpacer} />
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
    <View style={styles.contentContainer}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Teachings content coming soon...
      </Text>
      <View style={styles.topSpacer} />
    </View>
  );

  const renderPractices = () => (
    <View style={styles.contentContainer}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Practices content coming soon...
      </Text>
      <View style={styles.topSpacer} />
    </View>
  );

  const renderSessions = () => (
    <View style={styles.contentContainer}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Sessions content coming soon...
      </Text>
      <View style={styles.topSpacer} />
    </View>
  );

  const renderLearningPaths = () => (
    <View style={styles.contentContainer}>
      <Text style={[styles.comingSoon, { color: colors.textSecondary }]}>
        Learning paths coming soon...
      </Text>
      <View style={styles.topSpacer} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={isDarkMode ? "light-content" : "dark-content"} 
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
          <View style={[styles.backgroundOverlay, { backgroundColor: colors.overlay }]} />
        </View>
      )}
      
      <Animated.View style={[styles.header, { 
        backgroundColor: 'transparent', 
        paddingTop: insets.top + 10, 
        marginTop: 0,
        height: headerHeight,
        justifyContent: 'flex-start',
        alignItems: 'center'
      }]}>
        {onBack && (
          <TouchableOpacity style={[styles.backButton, { top: insets.top + 10 }]} onPress={onBack}>
            <FontAwesome name="arrow-left" size={20} color={colors.textPrimary} />
          </TouchableOpacity>
        )}
        
        {/* Expanded Header Layout */}
        <Animated.View style={[styles.headerContent, { opacity: titleOpacity }]}>
          <Animated.View style={[styles.teacherIcon, { 
            backgroundColor: getTeacherColor() + '20',
            width: profileImageSize,
            height: profileImageSize,
            borderRadius: profileImageBorderRadius,
          }]}>
            {getTeacherImage() ? (
              <Animated.Image
                source={getTeacherImage()}
                style={[styles.teacherImage, {
                  width: profileImageSize,
                  height: profileImageSize,
                  borderRadius: profileImageBorderRadius,
                }]}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.teacherIconText}>👤</Text>
            )}
          </Animated.View>
          <Animated.Text style={[styles.teacherName, { 
            color: colors.textPrimary,
            fontSize: 24,
          }]}>
            {teacher.displayName || teacher.name}
          </Animated.Text>
          <Animated.Text style={[styles.teacherTitle, { 
            color: colors.textSecondary,
            fontSize: 14,
          }]}>
            {teacher.tradition?.name || teacher.voiceStyle || 'Spiritual Teacher'}
          </Animated.Text>
          <Animated.Text style={[styles.followersCount, { 
            color: getTeacherColor(),
            fontSize: 16,
          }]}>
            {teacher.followers?.toLocaleString() || '0'} Followers
          </Animated.Text>
        </Animated.View>

        {/* Compact Header Layout */}
        <Animated.View style={[styles.compactHeader, { 
          top: insets.top + 10,
          opacity: scrollY.interpolate({
            inputRange: [0, HEADER_SCROLL_DISTANCE * 0.7, HEADER_SCROLL_DISTANCE],
            outputRange: [0, 0, 1],
            extrapolate: 'clamp',
          }),
        }]}>
          <View style={styles.compactTextContainer}>
            <Text style={[styles.compactTeacherName, { 
              color: colors.textPrimary,
            }]}>
              {teacher.displayName || teacher.name}
            </Text>
            <Text style={[styles.compactTeacherTitle, { 
              color: colors.textSecondary,
            }]}>
              {teacher.tradition?.name || teacher.voiceStyle || 'Spiritual Teacher'}
            </Text>
          </View>
          <View style={[styles.compactTeacherIcon, { 
            backgroundColor: getTeacherColor() + '20',
          }]}>
            {getTeacherImage() ? (
              <Image
                source={getTeacherImage()}
                style={styles.compactTeacherImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.teacherIconText}>👤</Text>
            )}
          </View>
        </Animated.View>
        
      </Animated.View>
      
      {/* Follow Button - Positioned outside main header */}
      <Animated.View style={[styles.followButtonContainer, { opacity: titleOpacity }]}>
        <TouchableOpacity
          style={[styles.followButton, { top: insets.top + 10 }]}
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
      </Animated.View>
      
      {renderTabs()}
      
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
        automaticallyAdjustContentInsets={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={brandColors.primary}
          />
        }
      >
        {renderContent()}
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    top: 0,
    padding: 8,
    height: 60, // Match compact header height
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15, // Higher than compact header
  },
  followButtonContainer: {
    position: 'absolute',
    right: -10, // Move further beyond the edge
    top: 15, // Move down more to align with back button
    height: 60, // Match compact header height
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 15, // Higher than compact header
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 20,
    flex: 1,
    justifyContent: 'center',
  },
  headerTextContainer: {
    alignItems: 'center',
    flex: 1,
  },
  compactHeader: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 70, // Consistent space for back button
    paddingRight: 20,
    paddingVertical: 12,
    height: 60,
    backgroundColor: 'transparent', // Transparent background to blend with background image
    zIndex: 10, // Higher than background overlay to ensure visibility
  },
  compactTeacherIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactTeacherImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  compactTextContainer: {
    flex: 1,
    marginRight: 12,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 36, // Ensure consistent height
  },
  compactTeacherName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  compactTeacherTitle: {
    fontSize: 12,
    opacity: 0.9,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  teacherIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    backgroundColor: '#FFF7ED',
    overflow: 'hidden',
  },
  teacherImage: {
    // Dimensions will be set via animation
  },
  teacherIconText: {
    fontSize: 40,
  },
  teacherName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  teacherTitle: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
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
    paddingVertical: 12,
    marginTop: 30, // Very tight spacing
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
    marginTop: 0,
    paddingTop: 0,
  },
  contentContainer: {
    minHeight: 600, // Ensure enough height to trigger scroll animation
  },
  topSpacer: {
    height: 100, // Space to allow scrolling up and see header expand
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
  fullWidthSection: {
    marginBottom: 24,
    marginTop: 0,
    paddingHorizontal: 20,
    paddingVertical: 16,
    width: '100%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
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
  },
  bioLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  bioValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TeacherProfilePage;
