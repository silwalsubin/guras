import React, { useState, useEffect, useMemo } from 'react';
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
  TextInput,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { loadSpiritualProfile } from '@/store/spiritualTeacherSlice';
import { OshoTeaching, OshoQuote, OshoPractice, BuddhaCategory } from '@/types/spiritual';
import TeacherSelector from '@/components/spiritual/TeacherSelector';
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
  const [showTeacherProfile, setShowTeacherProfile] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showQA, setShowQA] = useState(false);
  const [selectedTeaching, setSelectedTeaching] = useState<OshoTeaching | null>(null);
  const [selectedQuote, setSelectedQuote] = useState<OshoQuote | null>(null);
  const [selectedPractice, setSelectedPractice] = useState<OshoPractice | null>(null);
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'teachers' | 'practices' | 'philosophy' | 'courses'>('teachers');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
  }, []);

  // Mock search data
  const mockSearchData = useMemo(() => [
    // Teachers
    { id: 'osho', type: 'teacher', name: 'Osho', description: 'Spiritual Teacher', category: 'teachers', image: require('../../../assets/teachers/osho.jpg') },
    { id: 'buddha', type: 'teacher', name: 'Buddha', description: 'Spiritual Teacher', category: 'teachers', image: require('../../../assets/teachers/buddha.jpg') },
    
    // Practices
    { id: 'meditation', type: 'practice', name: 'Mindfulness Meditation', description: 'A practice of present-moment awareness', category: 'practices' },
    { id: 'breathing', type: 'practice', name: 'Breathing Exercises', description: 'Techniques for conscious breathing', category: 'practices' },
    { id: 'body-scan', type: 'practice', name: 'Body Scan', description: 'Progressive body awareness practice', category: 'practices' },
    
    // Philosophy
    { id: 'enlightenment', type: 'philosophy', name: 'Path to Enlightenment', description: 'Understanding the journey of spiritual awakening', category: 'philosophy' },
    { id: 'compassion', type: 'philosophy', name: 'Compassion & Love', description: 'Cultivating loving-kindness and compassion', category: 'philosophy' },
    { id: 'mindfulness', type: 'philosophy', name: 'Mindfulness Philosophy', description: 'The philosophy of present-moment awareness', category: 'philosophy' },
    
    // Courses
    { id: 'beginner-meditation', type: 'course', name: 'Meditation for Beginners', description: 'A comprehensive course for meditation newcomers', category: 'courses' },
    { id: 'advanced-practices', type: 'course', name: 'Advanced Spiritual Practices', description: 'Deep dive into advanced meditation techniques', category: 'courses' },
    { id: 'philosophy-course', type: 'course', name: 'Eastern Philosophy', description: 'Understanding Eastern spiritual traditions', category: 'courses' },
  ], []);

  // Filter search results
  const filteredResults = useMemo(() => {
    // If no search query and teachers category is selected, show all teachers
    if (!searchQuery.trim() && selectedCategory === 'teachers') {
      return mockSearchData.filter(item => item.category === 'teachers');
    }
    
    // If no search query, return empty array (show empty state)
    if (!searchQuery.trim()) return [];
    
    return mockSearchData.filter(item => {
      const matchesQuery = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesQuery && matchesCategory;
    });
  }, [searchQuery, selectedCategory, mockSearchData]);

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
    // No longer need to show TeacherDiscovery modal
  };

  const handleTeacherSelect = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowTeacherProfile(true);
  };

  const handleBackToDiscovery = () => {
    setShowTeacherProfile(false);
    // No longer need to show TeacherDiscovery since we have the search page
  };

  const renderSearchResult = ({ item }: { item: any }) => {
    const getCategoryIcon = (category: string) => {
      switch (category) {
        case 'teachers': return 'user';
        case 'practices': return 'play-circle';
        case 'philosophy': return 'heart';
        case 'courses': return 'graduation-cap';
        default: return 'file';
      }
    };

    const handleResultPress = () => {
      if (item.type === 'teacher') {
        setSelectedTeacher({ id: item.id, type: 'spiritual', displayName: item.name });
        setShowTeacherProfile(true);
      } else {
        // Handle other types of content
        Alert.alert(item.name, item.description);
      }
    };

    return (
      <TouchableOpacity 
        style={[styles.searchResultItem, { borderBottomColor: themeColors.border }]}
        onPress={handleResultPress}
      >
        <View style={styles.searchResultContent}>
          {item.image ? (
            <Image source={item.image} style={styles.searchResultImage} resizeMode="cover" />
          ) : (
            <View style={[styles.searchResultIcon, { backgroundColor: brandColors.primary + '20' }]}>
              <FontAwesome name={getCategoryIcon(item.category) as any} size={20} color={brandColors.primary} />
            </View>
          )}
          <View style={styles.searchResultText}>
            <Text style={[styles.searchResultTitle, { color: themeColors.textPrimary }]}>
              {item.name}
            </Text>
            <Text style={[styles.searchResultDescription, { color: themeColors.textSecondary }]}>
              {item.description}
            </Text>
          </View>
        </View>
        <FontAwesome name="chevron-right" size={16} color={themeColors.textSecondary} />
      </TouchableOpacity>
    );
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
          <View style={[styles.searchContainer, { backgroundColor: themeColors.background }]}>

            {/* Search Input */}
            <View style={[styles.searchInputContainer, { backgroundColor: themeColors.background }]}>
              <View style={[styles.searchInputWrapper, { backgroundColor: themeColors.background, borderColor: themeColors.border }]}>
                <FontAwesome name="search" size={16} color={themeColors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: themeColors.textPrimary }]}
                  placeholder="Search with Guras AI"
                  placeholderTextColor={themeColors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <FontAwesome name="times" size={16} color={themeColors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Category Filters */}
            <View style={[styles.categoryFilters, { backgroundColor: themeColors.background }]}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryFiltersContent}>
                {[
                  { key: 'all', label: 'All' },
                  { key: 'teachers', label: 'Teachers' },
                  { key: 'practices', label: 'Practices' },
                  { key: 'philosophy', label: 'Philosophy' },
                  { key: 'courses', label: 'Courses' },
                ].map((category) => (
                  <TouchableOpacity
                    key={category.key}
                    style={[
                      styles.categoryFilter,
                      {
                        backgroundColor: selectedCategory === category.key ? brandColors.primary : themeColors.background,
                        borderColor: selectedCategory === category.key ? brandColors.primary : themeColors.border,
                      }
                    ]}
                    onPress={() => setSelectedCategory(category.key as any)}
                  >
                    <Text style={[
                      styles.categoryFilterText,
                      { color: selectedCategory === category.key ? 'white' : themeColors.textPrimary }
                    ]}>
                      {category.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Search Results */}
            {filteredResults.length > 0 ? (
              <View style={styles.resultsContainer}>
                {searchQuery.length > 0 && (
                  <Text style={[styles.resultsCount, { color: themeColors.textSecondary }]}>
                    {filteredResults.length} results found
                  </Text>
                )}
                <FlatList
                  data={filteredResults}
                  keyExtractor={(item) => item.id}
                  renderItem={renderSearchResult}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.resultsList}
                />
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: themeColors.card }]}>
                <FontAwesome name="search" size={48} color={themeColors.textSecondary} />
                <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
                  {searchQuery.length > 0 ? 'No Results Found' : 'Start Searching'}
                </Text>
                <Text style={[styles.emptyStateSubtitle, { color: themeColors.textSecondary }]}>
                  {searchQuery.length > 0 
                    ? 'Try adjusting your search terms or selecting a different category'
                    : 'Search for teachers, practices, philosophy, or courses to discover new content'
                  }
                </Text>
              </View>
            )}
          </View>
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
  // Search styles
  searchContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  searchInputContainer: {
    padding: 24,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: '#1A1A1A',
  },
  categoryFilters: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  categoryFiltersContent: {
    paddingRight: 24,
  },
  categoryFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    backgroundColor: '#F8FAFC',
  },
  categoryFilterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  resultsContainer: {
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    marginBottom: 16,
    marginHorizontal: 24,
    color: '#666666',
  },
  resultsList: {
    paddingBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: 'transparent',
  },
  searchResultContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchResultImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 12,
  },
  searchResultIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  searchResultText: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1A1A1A',
  },
  searchResultDescription: {
    fontSize: 14,
    marginBottom: 4,
    color: '#666666',
  },
  searchResultCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#1A1A1A',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    color: '#666666',
  },
});

export default SpiritualTeacherScreen;
