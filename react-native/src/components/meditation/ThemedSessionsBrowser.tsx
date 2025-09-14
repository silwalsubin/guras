import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { GuidedMeditationSession, MeditationTheme, DifficultyLevel } from '@/types/meditation';
import { mockGuidedSessions } from '@/data/mockMeditationData';
import Icon from 'react-native-vector-icons/FontAwesome';

const { width } = Dimensions.get('window');

interface ThemedSessionsBrowserProps {
  onSessionSelect: (session: GuidedMeditationSession) => void;
  initialTheme?: MeditationTheme;
}

const ThemedSessionsBrowser: React.FC<ThemedSessionsBrowserProps> = ({
  onSessionSelect,
  initialTheme,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const [selectedTheme, setSelectedTheme] = useState<MeditationTheme | 'all'>(initialTheme || 'all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyLevel | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'duration' | 'rating' | 'newest'>('popular');

  const themes = [
    { key: 'all' as const, label: 'All Themes', icon: 'circle', color: brandColors.primary },
    { key: 'stress-relief' as const, label: 'Stress Relief', icon: 'heart', color: '#FF6B6B' },
    { key: 'sleep' as const, label: 'Sleep', icon: 'moon-o', color: '#4ECDC4' },
    { key: 'focus' as const, label: 'Focus', icon: 'eye', color: '#45B7D1' },
    { key: 'anxiety' as const, label: 'Anxiety', icon: 'shield', color: '#96CEB4' },
    { key: 'gratitude' as const, label: 'Gratitude', icon: 'smile-o', color: '#FFEAA7' },
    { key: 'mindfulness' as const, label: 'Mindfulness', icon: 'leaf', color: '#DDA0DD' },
    { key: 'compassion' as const, label: 'Compassion', icon: 'heart-o', color: '#FFB6C1' },
    { key: 'body-scan' as const, label: 'Body Scan', icon: 'user-o', color: '#98D8C8' },
  ];

  const difficulties = [
    { key: 'all' as const, label: 'All Levels' },
    { key: 'beginner' as const, label: 'Beginner' },
    { key: 'intermediate' as const, label: 'Intermediate' },
    { key: 'advanced' as const, label: 'Advanced' },
  ];

  const sortOptions = [
    { key: 'popular' as const, label: 'Most Popular', icon: 'fire' },
    { key: 'duration' as const, label: 'Duration', icon: 'clock-o' },
    { key: 'rating' as const, label: 'Highest Rated', icon: 'star' },
    { key: 'newest' as const, label: 'Newest', icon: 'calendar' },
  ];

  const filteredAndSortedSessions = useMemo(() => {
    const filtered = mockGuidedSessions.filter(session => {
      // Theme filter
      if (selectedTheme !== 'all' && session.theme !== selectedTheme) return false;
      
      // Difficulty filter
      if (selectedDifficulty !== 'all' && session.difficulty !== selectedDifficulty) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          session.title.toLowerCase().includes(query) ||
          session.description.toLowerCase().includes(query) ||
          session.teacher.name.toLowerCase().includes(query) ||
          session.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }
      
      return true;
    });

    // Sort sessions
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.completionCount - a.completionCount);
        break;
      case 'duration':
        filtered.sort((a, b) => a.duration - b.duration);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
        break;
    }

    return filtered;
  }, [selectedTheme, selectedDifficulty, searchQuery, sortBy]);

  const getThemeData = (themeKey: string) => {
    return themes.find(t => t.key === themeKey) || themes[0];
  };

  const renderThemeSelector = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.themeSelector}
      contentContainerStyle={styles.themeSelectorContent}
    >
      {themes.map((theme) => {
        const isSelected = selectedTheme === theme.key;
        return (
          <TouchableOpacity
            key={theme.key}
            style={[
              styles.themeChip,
              {
                backgroundColor: isSelected ? theme.color : themeColors.card,
                borderColor: isSelected ? theme.color : themeColors.border,
              }
            ]}
            onPress={() => setSelectedTheme(theme.key)}
          >
            <Icon 
              name={theme.icon} 
              size={14} 
              color={isSelected ? 'white' : theme.color} 
            />
            <Text style={[
              styles.themeChipText,
              { color: isSelected ? 'white' : themeColors.textPrimary }
            ]}>
              {theme.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );

  const renderFilters = () => (
    <View style={styles.filtersContainer}>
      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
        <Icon name="search" size={16} color={themeColors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: themeColors.textPrimary }]}
          placeholder="Search sessions..."
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="times" size={16} color={themeColors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {/* Difficulty Filter */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
        >
          {difficulties.map((difficulty) => {
            const isSelected = selectedDifficulty === difficulty.key;
            return (
              <TouchableOpacity
                key={difficulty.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: isSelected ? brandColors.primary : themeColors.card,
                    borderColor: isSelected ? brandColors.primary : themeColors.border,
                  }
                ]}
                onPress={() => setSelectedDifficulty(difficulty.key)}
              >
                <Text style={[
                  styles.filterChipText,
                  { color: isSelected ? 'white' : themeColors.textPrimary }
                ]}>
                  {difficulty.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Sort Dropdown */}
        <TouchableOpacity 
          style={[styles.sortButton, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
          onPress={() => {
            // TODO: Show sort options modal
            console.log('Show sort options');
          }}
        >
          <Icon name={sortOptions.find(s => s.key === sortBy)?.icon || 'sort'} size={14} color={themeColors.textSecondary} />
          <Text style={[styles.sortButtonText, { color: themeColors.textSecondary }]}>
            Sort
          </Text>
          <Icon name="chevron-down" size={12} color={themeColors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderSessionCard = (session: GuidedMeditationSession) => {
    const themeData = getThemeData(session.theme);
    
    return (
      <TouchableOpacity
        key={session.id}
        style={[styles.sessionCard, { backgroundColor: themeColors.card }]}
        onPress={() => onSessionSelect(session)}
        activeOpacity={0.7}
      >
        <View style={styles.sessionHeader}>
          <View style={[styles.sessionThemeIcon, { backgroundColor: themeData.color + '20' }]}>
            <Icon name={themeData.icon} size={16} color={themeData.color} />
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
          <Text style={[styles.sessionTeacher, { color: themeColors.textSecondary }]}>
            {session.teacher.name}
          </Text>
          <View style={styles.sessionStats}>
            <Text style={[styles.sessionDuration, { color: brandColors.primary }]}>
              {session.duration} min
            </Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={10} color="#FFD700" />
              <Text style={[styles.sessionRating, { color: themeColors.textSecondary }]}>
                {session.rating.toFixed(1)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderResults = () => (
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={[styles.resultsCount, { color: themeColors.textPrimary }]}>
          {filteredAndSortedSessions.length} sessions
        </Text>
        {selectedTheme !== 'all' && (
          <Text style={[styles.resultsTheme, { color: themeColors.textSecondary }]}>
            in {getThemeData(selectedTheme).label}
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.sessionsList}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
      >
        {filteredAndSortedSessions.map(renderSessionCard)}
        
        {filteredAndSortedSessions.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="search" size={48} color={themeColors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
              No sessions found
            </Text>
            <Text style={[styles.emptyDescription, { color: themeColors.textSecondary }]}>
              Try adjusting your filters or search terms
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      {renderThemeSelector()}
      {renderFilters()}
      {renderResults()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeSelector: {
    marginBottom: 16,
  },
  themeSelectorContent: {
    paddingHorizontal: 16,
  },
  themeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  themeChipText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    marginLeft: 8,
    marginRight: 8,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterScroll: {
    flex: 1,
    marginRight: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    marginRight: 8,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
  },
  sortButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginHorizontal: 6,
  },
  resultsContainer: {
    flex: 1,
  },
  resultsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsCount: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsTheme: {
    fontSize: 14,
    marginLeft: 4,
  },
  sessionsList: {
    flex: 1,
    paddingHorizontal: 16,
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
  sessionTeacher: {
    fontSize: 12,
    flex: 1,
  },
  sessionStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionDuration: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sessionRating: {
    fontSize: 12,
    marginLeft: 2,
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

export default ThemedSessionsBrowser;
