import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { fetchJournalEntries, selectEntry } from '@/store/journalSlice';
import { setJournalCreateOpen } from '@/store/bottomNavSlice';
import JournalEntryCard from '@/components/journal/JournalEntryCard';
import JournalCreateScreen from './JournalCreateScreen';
import JournalEditScreen from './JournalEditScreen';
import { JournalEntry } from '@/types/journal';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useAuth } from '@/contexts/AuthContext';

const JournalScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const { user } = useAuth();
  const { entries, selectedEntry, isLoading, error } = useSelector((state: RootState) => state.journal);

  const [showCreateScreen, setShowCreateScreen] = useState(false);
  const [showEditScreen, setShowEditScreen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (user?.uid) {
      console.log('📔 Journal: User authenticated, loading entries for user:', user.uid);
      loadEntries();
    } else {
      console.log('📔 Journal: User not authenticated yet');
    }
  }, [user?.uid]);

  const loadEntries = async (search?: string) => {
    if (user?.uid) {
      console.log('📔 Journal: Fetching entries for user:', user.uid, search ? `with search: ${search}` : '');
      try {
        await dispatch(fetchJournalEntries({ userId: user.uid, search }));
      } catch (err) {
        console.error('📔 Journal: Error loading entries:', err);
      }
    } else {
      console.log('📔 Journal: Cannot load entries - user not authenticated');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadEntries();
    setRefreshing(false);
  };

  // Group entries by date
  const groupEntriesByDate = (entries: JournalEntry[]) => {
    const grouped: { [key: string]: JournalEntry[] } = {};

    entries.forEach((entry) => {
      const date = new Date(entry.createdAt);
      const dateKey = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(entry);
    });

    // Convert to array and sort by date (newest first)
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => {
        return new Date(dateB).getTime() - new Date(dateA).getTime();
      })
      .map(([date, items]) => ({ date, items }));
  };

  const groupedEntries = groupEntriesByDate(entries);

  const handleEntryPress = (entry: JournalEntry) => {
    dispatch(selectEntry(entry));
    setShowEditScreen(true);
    dispatch(setJournalCreateOpen(true)); // Hide bottom nav
  };

  const handleEditClose = () => {
    setShowEditScreen(false);
    dispatch(selectEntry(null));
    dispatch(setJournalCreateOpen(false)); // Show bottom nav
    loadEntries(); // Refresh list after editing entry
  };

  const handleCreateClose = () => {
    setShowCreateScreen(false);
    dispatch(setJournalCreateOpen(false));
    loadEntries(); // Refresh list after creating entry
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FontAwesome name="book" size={48} color={themeColors.textSecondary} />
      <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
        No entries yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
        Start journaling by tapping the + button
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorContainer}>
      <FontAwesome name="exclamation-circle" size={48} color={brandColors.primary} />
      <Text style={[styles.errorTitle, { color: themeColors.textPrimary }]}>
        Error loading entries
      </Text>
      <Text style={[styles.errorMessage, { color: themeColors.textSecondary }]}>
        {error || 'Something went wrong'}
      </Text>
      <TouchableOpacity
        style={[styles.retryButton, { backgroundColor: brandColors.primary }]}
        onPress={loadEntries}
      >
        <Text style={styles.retryButtonText}>Retry</Text>
      </TouchableOpacity>
    </View>
  );

  // If edit screen is open, show it full screen
  if (showEditScreen && selectedEntry) {
    return <JournalEditScreen entry={selectedEntry} onClose={handleEditClose} />;
  }

  // If create screen is open, show it full screen
  if (showCreateScreen) {
    return <JournalCreateScreen onClose={handleCreateClose} />;
  }

  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>Journal</Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={[
            styles.searchInput,
            {
              backgroundColor: themeColors.cardBackground,
              color: themeColors.textPrimary,
              borderColor: themeColors.border,
            },
          ]}
          placeholder="Search by title or content..."
          placeholderTextColor={themeColors.textSecondary}
          value={searchQuery}
          onChangeText={(text) => {
            setSearchQuery(text);
            loadEntries(text);
          }}
        />
      </View>

      {/* Content */}
      {isLoading && entries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={brandColors.primary} />
        </View>
      ) : error && entries.length === 0 ? (
        renderErrorState()
      ) : entries.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={groupedEntries}
          keyExtractor={(item) => item.date}
          renderItem={({ item: group }) => (
            <View>
              {/* Date Header */}
              <View style={styles.dateHeaderContainer}>
                <Text style={[styles.dateHeader, { color: themeColors.textSecondary }]}>
                  {group.date}
                </Text>
              </View>
              {/* Entries for this date */}
              {group.items.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onPress={handleEntryPress}
                />
              ))}
            </View>
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={isDarkMode ? '#FFFFFF' : '#000000'}
              colors={[brandColors.primary]}
            />
          }
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: brandColors.primary }]}
        onPress={() => {
          setShowCreateScreen(true);
          dispatch(setJournalCreateOpen(true));
        }}
      >
        <FontAwesome name="plus" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
  listContent: {
    paddingVertical: 8,
  },
  dateHeaderContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 12,
  },
  dateHeader: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});

export default JournalScreen;

