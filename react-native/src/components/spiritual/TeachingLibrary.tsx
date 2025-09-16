import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { setSelectedCategory, setSearchQuery } from '@/store/spiritualTeacherSlice';
import { OshoTeaching, OshoQuote, OshoPractice, OshoCategory } from '@/types/spiritual';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

interface TeachingLibraryProps {
  onTeachingPress?: (teaching: OshoTeaching) => void;
  onQuotePress?: (quote: OshoQuote) => void;
  onPracticePress?: (practice: OshoPractice) => void;
}

const TeachingLibrary: React.FC<TeachingLibraryProps> = ({
  onTeachingPress,
  onQuotePress,
  onPracticePress,
}) => {
  const dispatch = useDispatch();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  
  const { 
    oshoTeachings, 
    oshoQuotes, 
    oshoPractices, 
    oshoCategories, 
    selectedCategory, 
    searchQuery 
  } = useSelector((state: RootState) => state.spiritualTeacher);

  const [activeTab, setActiveTab] = useState<'teachings' | 'quotes' | 'practices'>('teachings');

  const filteredTeachings = useMemo(() => {
    let filtered = oshoTeachings;
    
    if (selectedCategory) {
      filtered = filtered.filter(teaching => teaching.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(teaching =>
        teaching.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teaching.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teaching.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [oshoTeachings, selectedCategory, searchQuery]);

  const filteredQuotes = useMemo(() => {
    let filtered = oshoQuotes;
    
    if (selectedCategory) {
      filtered = filtered.filter(quote => quote.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(quote =>
        quote.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
        quote.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [oshoQuotes, selectedCategory, searchQuery]);

  const filteredPractices = useMemo(() => {
    let filtered = oshoPractices;
    
    if (selectedCategory) {
      filtered = filtered.filter(practice => practice.category === selectedCategory);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(practice =>
        practice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        practice.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        practice.benefits.some(benefit => benefit.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    return filtered;
  }, [oshoPractices, selectedCategory, searchQuery]);

  const handleCategorySelect = (category: OshoCategory | null) => {
    dispatch(setSelectedCategory(category));
  };

  const handleSearchChange = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const renderCategoryFilter = () => {
    return (
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.categoryFilter}
        contentContainerStyle={styles.categoryFilterContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            {
              backgroundColor: selectedCategory === null ? brandColors.primary : themeColors.card,
              borderColor: selectedCategory === null ? brandColors.primary : themeColors.border,
            },
          ]}
          onPress={() => handleCategorySelect(null)}
        >
          <Text
            style={[
              styles.categoryChipText,
              {
                color: selectedCategory === null ? '#FFFFFF' : themeColors.textPrimary,
              },
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        
        {Object.entries(oshoCategories).map(([key, category]) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.categoryChip,
              {
                backgroundColor: selectedCategory === key ? brandColors.primary : themeColors.card,
                borderColor: selectedCategory === key ? brandColors.primary : themeColors.border,
              },
            ]}
            onPress={() => handleCategorySelect(key as OshoCategory)}
          >
            <Text style={styles.categoryIcon}>{category.icon}</Text>
            <Text
              style={[
                styles.categoryChipText,
                {
                  color: selectedCategory === key ? '#FFFFFF' : themeColors.textPrimary,
                },
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    );
  };

  const renderTeachingCard = ({ item }: { item: OshoTeaching }) => {
    const categoryData = oshoCategories[item.category];
    
    return (
      <TouchableOpacity
        style={[styles.contentCard, { backgroundColor: themeColors.card }]}
        onPress={() => onTeachingPress?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryData.color }]}>
            <Text style={styles.categoryBadgeText}>{categoryData.name}</Text>
          </View>
          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, { color: themeColors.textSecondary }]}>
              {item.spiritualLevel}
            </Text>
          </View>
        </View>
        
        <Text style={[styles.contentTitle, { color: themeColors.textPrimary }]}>
          {item.title}
        </Text>
        
        <Text style={[styles.contentDescription, { color: themeColors.textSecondary }]}>
          {item.content.length > 150 
            ? `${item.content.substring(0, 150)}...` 
            : item.content
          }
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.tagsContainer}>
            {item.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={[styles.tag, { backgroundColor: themeColors.background }]}>
                <Text style={[styles.tagText, { color: themeColors.textSecondary }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
          
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={12} color={brandColors.primary} />
            <Text style={[styles.ratingText, { color: themeColors.textSecondary }]}>
              {item.teachingValue}/10
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderQuoteCard = ({ item }: { item: OshoQuote }) => {
    const categoryData = oshoCategories[item.category];
    
    return (
      <TouchableOpacity
        style={[styles.contentCard, { backgroundColor: themeColors.card }]}
        onPress={() => onQuotePress?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.quoteHeader}>
          <FontAwesome name="quote-left" size={16} color={brandColors.primary} />
          <View style={[styles.categoryBadge, { backgroundColor: categoryData.color }]}>
            <Text style={styles.categoryBadgeText}>{categoryData.name}</Text>
          </View>
        </View>
        
        <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
          "{item.text}"
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={[styles.quoteSource, { color: themeColors.textSecondary }]}>
            — {item.source.title}
            {item.source.year && ` (${item.source.year})`}
          </Text>
          
          <View style={styles.ratingContainer}>
            <FontAwesome name="star" size={12} color={brandColors.primary} />
            <Text style={[styles.ratingText, { color: themeColors.textSecondary }]}>
              {item.teachingValue}/10
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderPracticeCard = ({ item }: { item: OshoPractice }) => {
    const categoryData = oshoCategories[item.category];
    
    return (
      <TouchableOpacity
        style={[styles.contentCard, { backgroundColor: themeColors.card }]}
        onPress={() => onPracticePress?.(item)}
        activeOpacity={0.8}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.categoryBadge, { backgroundColor: categoryData.color }]}>
            <Text style={styles.categoryBadgeText}>{categoryData.name}</Text>
          </View>
          <View style={styles.difficultyBadge}>
            <Text style={[styles.difficultyText, { color: themeColors.textSecondary }]}>
              {item.difficulty}
            </Text>
          </View>
        </View>
        
        <View style={styles.practiceHeader}>
          <FontAwesome name="play-circle" size={20} color={brandColors.primary} />
          <Text style={[styles.contentTitle, { color: themeColors.textPrimary }]}>
            {item.name}
          </Text>
        </View>
        
        <Text style={[styles.contentDescription, { color: themeColors.textSecondary }]}>
          {item.description}
        </Text>
        
        <View style={styles.practiceInfo}>
          <View style={styles.practiceDetail}>
            <FontAwesome name="clock-o" size={12} color={themeColors.textSecondary} />
            <Text style={[styles.practiceDetailText, { color: themeColors.textSecondary }]}>
              {item.duration.recommended} min
            </Text>
          </View>
          <View style={styles.practiceDetail}>
            <FontAwesome name="signal" size={12} color={themeColors.textSecondary} />
            <Text style={[styles.practiceDetailText, { color: themeColors.textSecondary }]}>
              {item.effectiveness}/10
            </Text>
          </View>
        </View>
        
        <View style={styles.benefitsContainer}>
          {item.benefits.slice(0, 2).map((benefit, index) => (
            <View key={index} style={[styles.benefitChip, { backgroundColor: brandColors.primary }]}>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={[styles.emptyState, { backgroundColor: themeColors.card }]}>
        <FontAwesome name="search" size={48} color={themeColors.textSecondary} />
        <Text style={[styles.emptyStateTitle, { color: themeColors.textPrimary }]}>
          No {activeTab} found
        </Text>
        <Text style={[styles.emptyStateDescription, { color: themeColors.textSecondary }]}>
          Try adjusting your search or category filter
        </Text>
      </View>
    );
  };

  const getCurrentData = () => {
    switch (activeTab) {
      case 'teachings':
        return filteredTeachings;
      case 'quotes':
        return filteredQuotes;
      case 'practices':
        return filteredPractices;
      default:
        return [];
    }
  };

  const renderCurrentContent = () => {
    const data = getCurrentData();
    
    if (data.length === 0) {
      return renderEmptyState();
    }

    switch (activeTab) {
      case 'teachings':
        return (
          <FlatList
            data={data}
            renderItem={renderTeachingCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );
      case 'quotes':
        return (
          <FlatList
            data={data}
            renderItem={renderQuoteCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );
      case 'practices':
        return (
          <FlatList
            data={data}
            renderItem={renderPracticeCard}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.card }]}>
        <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
          Teaching Library
        </Text>
        <Text style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}>
          Explore Osho's wisdom and practices
        </Text>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: themeColors.card }]}>
        <FontAwesome name="search" size={16} color={themeColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.textPrimary }]}
          placeholder="Search teachings, quotes, or practices..."
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearchChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearchChange('')}>
            <FontAwesome name="times" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter */}
      {renderCategoryFilter()}

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: themeColors.card }]}>
        {[
          { key: 'teachings', label: 'Teachings', icon: 'book' },
          { key: 'quotes', label: 'Quotes', icon: 'quote-left' },
          { key: 'practices', label: 'Practices', icon: 'play-circle' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              {
                backgroundColor: activeTab === tab.key ? brandColors.primary : 'transparent',
              },
            ]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <FontAwesome
              name={tab.icon as any}
              size={16}
              color={activeTab === tab.key ? '#FFFFFF' : themeColors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                {
                  color: activeTab === tab.key ? '#FFFFFF' : themeColors.textSecondary,
                },
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <View style={styles.contentContainer}>
        {renderCurrentContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    margin: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  categoryFilter: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  categoryFilterContent: {
    paddingRight: 15,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  tabContainer: {
    flexDirection: 'row',
    margin: 15,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  listContent: {
    paddingBottom: 20,
  },
  contentCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  difficultyBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  difficultyText: {
    fontSize: 12,
    fontWeight: '600',
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contentDescription: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 12,
    marginLeft: 4,
  },
  quoteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 18,
    lineHeight: 26,
    fontStyle: 'italic',
    marginBottom: 12,
  },
  quoteSource: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  practiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  practiceDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
  },
  practiceDetailText: {
    fontSize: 12,
    marginLeft: 4,
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  benefitChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 6,
    marginBottom: 4,
  },
  benefitText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    borderRadius: 12,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default TeachingLibrary;
