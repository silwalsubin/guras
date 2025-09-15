import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
  ScrollView,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { loadSpiritualProfile } from '@/store/spiritualTeacherSlice';
import { OshoTeaching, OshoQuote, OshoPractice, BuddhaCategory } from '@/types/spiritual';
import TeacherSelector from '@/components/spiritual/TeacherSelector';
import TeacherDiscovery from '@/components/spiritual/TeacherDiscovery';
import TeacherProfilePage from '@/components/spiritual/TeacherProfilePage';
import SpiritualQA from '@/components/spiritual/SpiritualQA';
import DailyGuidance from '@/components/spiritual/DailyGuidance';
import TeachingLibrary from '@/components/spiritual/TeachingLibrary';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

const SpiritualTeacherScreen: React.FC = () => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const { spiritualProfile, isLoading, currentTeacher } = useSelector(
    (state: RootState) => state.spiritualTeacher
  );

  const [activeTab, setActiveTab] = useState<'discover' | 'profile' | 'qa' | 'guidance' | 'library'>('discover');
  const [showTeacherSelector, setShowTeacherSelector] = useState(false);
  const [showTeacherDiscovery, setShowTeacherDiscovery] = useState(false);
  const [showTeacherProfile, setShowTeacherProfile] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showQA, setShowQA] = useState(false);
  const [selectedTeaching, setSelectedTeaching] = useState<OshoTeaching | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<OshoQuote | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<OshoPractice | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      // TODO: Get actual user ID from auth context
      await dispatch(loadSpiritualProfile('user123'));
    } catch (error) {
      Alert.alert('Error', 'Failed to load spiritual profile. Please try again.');
    }
  };

  const handleAskQuestion = () => {
    setActiveTab('qa');
    setShowQA(true);
  };

  const handleStartPractice = () => {
    setActiveTab('guidance');
  };

  const handleExploreTeachings = () => {
    setActiveTab('library');
  };

  const handleTeachingPress = (teaching: OshoTeaching) => {
    setSelectedTeaching(teaching);
    // TODO: Navigate to teaching detail screen
    Alert.alert('Teaching', `Selected: ${teaching.title}`);
  };

  const handleQuotePress = (quote: OshoQuote) => {
    setSelectedQuote(quote);
    // TODO: Navigate to quote detail screen
    Alert.alert('Quote', `Selected: "${quote.text}"`);
  };

  const handlePracticePress = (practice: OshoPractice) => {
    setSelectedPractice(practice);
    // TODO: Navigate to practice detail screen
    Alert.alert('Practice', `Selected: ${practice.name}`);
  };

  const handleTeacherSelectorSelect = (teacherId: string) => {
    setShowTeacherSelector(false);
    // Teacher selection is handled by Redux
  };

  const handleCategorySelect = (category: BuddhaCategory) => {
    // TODO: Navigate to category detail screen
    Alert.alert('Category', `Selected: ${category}`);
  };

  const handleDiscoverTeachers = () => {
    setActiveTab('discover');
    setShowTeacherDiscovery(true);
  };

  const handleTeacherSelect = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowTeacherProfile(true);
    setShowTeacherDiscovery(false);
  };

  const handleBackToDiscovery = () => {
    setShowTeacherProfile(false);
    setShowTeacherDiscovery(true);
  };


  const renderContent = () => {
    switch (activeTab) {
      case 'profile':
        if (currentTeacher) {
          return (
            <TeacherProfilePage
              teacher={currentTeacher}
              onContentPress={(content) => {
                // TODO: Handle content press
                console.log('Content pressed:', content);
              }}
              onLearningPathPress={(path) => {
                // TODO: Handle learning path press
                console.log('Learning path pressed:', path);
              }}
              onBack={() => {
                // No back action needed in main screen
              }}
            />
          );
        } else {
          return (
            <View style={[styles.discoverContainer, { backgroundColor: themeColors.background }]}>
              <Text style={[styles.discoverTitle, { color: themeColors.textPrimary }]}>
                No Teacher Selected
              </Text>
              <Text style={[styles.discoverSubtitle, { color: themeColors.textSecondary }]}>
                Choose a teacher to view their profile
              </Text>
            </View>
          );
        }
      case 'discover':
        return (
          <ScrollView style={[styles.discoverContainer, { backgroundColor: themeColors.background }]}>
            {/* Header */}
            <View style={[styles.discoverHeader, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.discoverTitle, { color: themeColors.textPrimary }]}>
                Discover Teachers
              </Text>
              <Text style={[styles.discoverSubtitle, { color: themeColors.textSecondary }]}>
                Find spiritual and meditation teachers whose wisdom resonates with you
              </Text>
            </View>

            {/* Quick Actions */}
            <View style={[styles.quickActions, { backgroundColor: themeColors.surface }]}>
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: brandColors.primary }]}
                onPress={handleDiscoverTeachers}
              >
                <FontAwesome name="search" size={20} color="white" />
                <Text style={styles.quickActionText}>Browse All Teachers</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.quickActionButton, { backgroundColor: brandColors.secondary }]}
                onPress={() => setActiveTab('profile')}
              >
                <FontAwesome name="user" size={20} color="white" />
                <Text style={styles.quickActionText}>My Current Teacher</Text>
              </TouchableOpacity>
            </View>

            {/* Learning Categories */}
            <View style={[styles.learningSection, { backgroundColor: themeColors.surface }]}>
              <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                Learning Categories
              </Text>
              <View style={styles.categoriesGrid}>
                <TouchableOpacity style={[styles.categoryCard, { backgroundColor: themeColors.background }]}>
                  <FontAwesome name="book" size={24} color={brandColors.primary} />
                  <Text style={[styles.categoryTitle, { color: themeColors.textPrimary }]}>Teachings</Text>
                  <Text style={[styles.categoryDescription, { color: themeColors.textSecondary }]}>Wisdom & Philosophy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.categoryCard, { backgroundColor: themeColors.background }]}>
                  <FontAwesome name="play-circle" size={24} color={brandColors.primary} />
                  <Text style={[styles.categoryTitle, { color: themeColors.textPrimary }]}>Practices</Text>
                  <Text style={[styles.categoryDescription, { color: themeColors.textSecondary }]}>Meditation & Exercises</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.categoryCard, { backgroundColor: themeColors.background }]}>
                  <FontAwesome name="graduation-cap" size={24} color={brandColors.primary} />
                  <Text style={[styles.categoryTitle, { color: themeColors.textPrimary }]}>Courses</Text>
                  <Text style={[styles.categoryDescription, { color: themeColors.textSecondary }]}>Structured Learning</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={[styles.categoryCard, { backgroundColor: themeColors.background }]}>
                  <FontAwesome name="heart" size={24} color={brandColors.primary} />
                  <Text style={[styles.categoryTitle, { color: themeColors.textPrimary }]}>Philosophy</Text>
                  <Text style={[styles.categoryDescription, { color: themeColors.textSecondary }]}>Deep Insights</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Popular Teachers Preview */}
            <View style={[styles.teachersPreview, { backgroundColor: themeColors.surface }]}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: themeColors.textPrimary }]}>
                  Popular Teachers
                </Text>
                <TouchableOpacity onPress={handleDiscoverTeachers}>
                  <Text style={[styles.seeAllText, { color: brandColors.primary }]}>See All</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.teacherPreviewCards}>
                <TouchableOpacity 
                  style={[styles.teacherPreviewCard, { backgroundColor: themeColors.background }]}
                  onPress={() => {
                    setSelectedTeacher({ id: 'osho', type: 'spiritual', displayName: 'Osho' });
                    setShowTeacherProfile(true);
                  }}
                >
                  <Image
                    source={require('../../../assets/teachers/osho.jpg')}
                    style={styles.teacherPreviewImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.teacherPreviewName, { color: themeColors.textPrimary }]}>Osho</Text>
                  <Text style={[styles.teacherPreviewTitle, { color: themeColors.textSecondary }]}>Spiritual Teacher</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.teacherPreviewCard, { backgroundColor: themeColors.background }]}
                  onPress={() => {
                    setSelectedTeacher({ id: 'buddha', type: 'spiritual', displayName: 'Buddha' });
                    setShowTeacherProfile(true);
                  }}
                >
                  <Image
                    source={require('../../../assets/teachers/buddha.jpg')}
                    style={styles.teacherPreviewImage}
                    resizeMode="cover"
                  />
                  <Text style={[styles.teacherPreviewName, { color: themeColors.textPrimary }]}>Buddha</Text>
                  <Text style={[styles.teacherPreviewTitle, { color: themeColors.textSecondary }]}>Spiritual Teacher</Text>
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>
        );
      case 'qa':
        return (
          <SpiritualQA
            onClose={() => setShowQA(false)}
          />
        );
      case 'guidance':
        return (
          <DailyGuidance
            onStartPractice={handlePracticePress}
            onExploreQuote={handleQuotePress}
          />
        );
      case 'library':
        return (
          <TeachingLibrary
            onTeachingPress={handleTeachingPress}
            onQuotePress={handleQuotePress}
            onPracticePress={handlePracticePress}
          />
        );
      default:
        return null;
    }
  };

  const renderWelcomeHeader = () => {
    if (activeTab !== 'profile') return null;

    const teacherName = currentTeacher?.displayName || 'Your Teacher';
    const teacherDescription = currentTeacher?.description || 'Connect with spiritual wisdom';

    return (
      <View style={[styles.welcomeHeader, { backgroundColor: themeColors.card }]}>
        <View style={styles.welcomeContent}>
          <Text style={[styles.welcomeTitle, { color: themeColors.textPrimary }]}>
            Welcome to Your Spiritual Journey
          </Text>
          <Text style={[styles.welcomeSubtitle, { color: themeColors.textSecondary }]}>
            Connect with {teacherName}'s wisdom and transform your life
          </Text>
        </View>
        <TouchableOpacity
          style={[styles.welcomeIcon, { backgroundColor: brandColors.primary }]}
          onPress={() => setShowTeacherSelector(true)}
        >
          <FontAwesome name="exchange" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {renderWelcomeHeader()}
      
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* QA Modal */}
        <Modal
          visible={showQA}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowQA(false)}
        >
        <SpiritualQA onClose={() => setShowQA(false)} />
      </Modal>

      {/* Teacher Selector Modal */}
      <Modal
        visible={showTeacherSelector}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowTeacherSelector(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: themeColors.card }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              Choose Your Teacher
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowTeacherSelector(false)}
            >
              <FontAwesome name="times" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>
          <TeacherSelector onTeacherSelect={handleTeacherSelectorSelect} />
        </View>
      </Modal>

      {/* Teacher Discovery Modal */}
      <TeacherDiscovery
        visible={showTeacherDiscovery}
        onClose={() => setShowTeacherDiscovery(false)}
        onTeacherSelect={handleTeacherSelect}
      />

      {/* Teacher Profile Modal */}
      {selectedTeacher && (
        <Modal
          visible={showTeacherProfile}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowTeacherProfile(false)}
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
            onBack={handleBackToDiscovery}
          />
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    margin: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1F2937',
  },
  welcomeSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    color: '#6B7280',
  },
  welcomeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
  },
  discoverContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  discoverHeader: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  discoverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1A1A1A',
  },
  discoverSubtitle: {
    fontSize: 17,
    lineHeight: 24,
    color: '#666666',
  },
  quickActions: {
    flexDirection: 'row',
    padding: 24,
    marginBottom: 20,
    gap: 16,
    backgroundColor: '#FFFFFF',
  },
  quickActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  learningSection: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1A1A1A',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCard: {
    width: '48%',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 6,
    color: '#1A1A1A',
  },
  categoryDescription: {
    fontSize: 13,
    textAlign: 'center',
    color: '#666666',
    lineHeight: 18,
  },
  teachersPreview: {
    padding: 24,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  seeAllText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B35',
  },
  teacherPreviewCards: {
    flexDirection: 'row',
    gap: 16,
  },
  teacherPreviewCard: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  teacherPreviewImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  teacherPreviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1A1A1A',
  },
  teacherPreviewTitle: {
    fontSize: 13,
    textAlign: 'center',
    color: '#666666',
  },
});

export default SpiritualTeacherScreen;
