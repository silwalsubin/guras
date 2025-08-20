import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { BaseCard } from '@/components/shared';
import Icon from 'react-native-vector-icons/FontAwesome';
import { apiService, AudioFile } from '@/services/api';

// Define MeditationTrack interface locally
export interface MeditationTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  artwork?: string;
  duration?: number;
  category: 'ambient' | 'nature' | 'meditation' | 'binaural';
  isLoop: boolean;
}

// Helper functions for categorizing audio files
const categorizeAudioFile = (audioFile: AudioFile): MeditationTrack['category'] => {
  const name = audioFile.name.toLowerCase();
  const description = (audioFile.description || '').toLowerCase();

  if (name.includes('rain') || name.includes('ocean') || name.includes('forest') ||
      name.includes('nature') || description.includes('nature')) {
    return 'nature';
  }

  if (name.includes('meditation') || name.includes('zen') || name.includes('mindful') ||
      description.includes('meditation')) {
    return 'meditation';
  }

  if (name.includes('binaural') || name.includes('frequency') || name.includes('hz') ||
      description.includes('binaural')) {
    return 'binaural';
  }

  return 'ambient';
};

const getCategoryLabel = (category: MeditationTrack['category']): string => {
  switch (category) {
    case 'ambient': return 'Ambient';
    case 'nature': return 'Nature';
    case 'meditation': return 'Meditation';
    case 'binaural': return 'Binaural';
    default: return 'Other';
  }
};

interface MeditationMusicSelectorProps {
  selectedTrack: MeditationTrack | null;
  onTrackSelect: (track: MeditationTrack | null) => void;
  disabled?: boolean;
}

const MeditationMusicSelector: React.FC<MeditationMusicSelectorProps> = ({
  selectedTrack,
  onTrackSelect,
  disabled = false,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<MeditationTrack['category'] | 'all'>('all');
  const [categories, setCategories] = useState<Array<{ category: MeditationTrack['category']; count: number; label: string }>>([]);
  const [availableTracks, setAvailableTracks] = useState<MeditationTrack[]>([]);
  const [loading, setLoading] = useState(false);

  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  // Load audio files directly from API (same as Audio screen)
  useEffect(() => {
    const loadAudioFiles = async () => {
      try {
        console.log('🎵 DEBUG: Loading audio files directly from API...');
        const response = await apiService.getAudioFiles();
        console.log('🎵 DEBUG: API response:', response);

        if (response.data && response.data.files.length > 0) {
          // Convert audio files to meditation tracks
          const tracks: MeditationTrack[] = response.data.files.map(audioFile => ({
            id: audioFile.id,
            title: audioFile.name,
            artist: audioFile.author,
            url: audioFile.audioDownloadUrl,
            artwork: audioFile.thumbnailDownloadUrl,
            duration: audioFile.durationSeconds || 300,
            category: categorizeAudioFile(audioFile),
            isLoop: true,
          }));

          setAvailableTracks(tracks);
          console.log('🎵 DEBUG: Converted to meditation tracks:', tracks);

          // Create categories from tracks
          const categoryMap = new Map();
          tracks.forEach(track => {
            const count = categoryMap.get(track.category) || 0;
            categoryMap.set(track.category, count + 1);
          });

          const cats = Array.from(categoryMap.entries()).map(([category, count]) => ({
            category: category as MeditationTrack['category'],
            count,
            label: getCategoryLabel(category as MeditationTrack['category']),
          }));

          setCategories(cats);
          console.log('🎵 DEBUG: Created categories:', cats);
        } else {
          console.warn('🎵 WARNING: No audio files found');
          setAvailableTracks([]);
          setCategories([]);
        }
      } catch (error) {
        console.error('🎵 ERROR: Failed to load audio files:', error);
        setAvailableTracks([]);
        setCategories([]);
      }
    };
    loadAudioFiles();
  }, []);

  // Filter tracks when category changes
  const filteredTracks = useMemo(() => {
    if (selectedCategory === 'all') {
      return availableTracks;
    }
    return availableTracks.filter(track => track.category === selectedCategory);
  }, [availableTracks, selectedCategory]);

  const handleTrackSelect = (track: MeditationTrack) => {
    console.log('🎵 DEBUG: Track selected:', track);
    onTrackSelect(track);
    setIsModalVisible(false);
  };

  const handleNoMusicSelect = () => {
    console.log('🎵 DEBUG: No music selected (silent meditation)');
    onTrackSelect(null);
    setIsModalVisible(false);
  };

  const getCategoryIcon = (category: MeditationTrack['category']): string => {
    switch (category) {
      case 'ambient': return 'volume-up';
      case 'nature': return 'leaf';
      case 'meditation': return 'heart';
      case 'binaural': return 'headphones';
      default: return 'music';
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selectorButton,
          {
            backgroundColor: themeColors.cardBackground,
            borderColor: selectedTrack ? brandColors.primary : themeColors.border,
            opacity: disabled ? 0.6 : 1,
          }
        ]}
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
      >
        <View style={styles.selectorContent}>
          <Icon 
            name="music" 
            size={16} 
            color={selectedTrack ? brandColors.primary : themeColors.textSecondary} 
          />
          <Text style={[
            styles.selectorText,
            { 
              color: selectedTrack ? themeColors.textPrimary : themeColors.textSecondary,
              fontWeight: selectedTrack ? '600' : '400',
            }
          ]}>
            {selectedTrack ? selectedTrack.title : 'Select meditation music'}
          </Text>
          <Icon 
            name="chevron-down" 
            size={12} 
            color={themeColors.textSecondary} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <SafeAreaView style={[styles.modalContainer, { backgroundColor: themeColors.background }]}>
          {/* Header */}
          <View style={[styles.modalHeader, { borderBottomColor: themeColors.border }]}>
            <Text style={[styles.modalTitle, { color: themeColors.textPrimary }]}>
              Choose Meditation Music
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setIsModalVisible(false)}
            >
              <Icon name="times" size={20} color={themeColors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category Filter */}
          <View style={styles.categoryFilterWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoryFilter}
              contentContainerStyle={styles.categoryFilterContent}
            >
            <TouchableOpacity
              style={[
                styles.categoryButton,
                {
                  backgroundColor: selectedCategory === 'all' ? brandColors.primary : themeColors.cardBackground,
                  borderColor: selectedCategory === 'all' ? brandColors.primary : themeColors.border,
                }
              ]}
              onPress={() => setSelectedCategory('all')}
            >
              <Text style={[
                styles.categoryButtonText,
                { 
                  color: selectedCategory === 'all' ? 'white' : themeColors.textPrimary,
                }
              ]}>
                All
              </Text>
            </TouchableOpacity>

            {categories.map(({ category, count, label }) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? brandColors.primary : themeColors.cardBackground,
                    borderColor: selectedCategory === category ? brandColors.primary : themeColors.border,
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Icon 
                  name={getCategoryIcon(category)} 
                  size={14} 
                  color={selectedCategory === category ? 'white' : themeColors.textSecondary}
                  style={styles.categoryIcon}
                />
                <Text style={[
                  styles.categoryButtonText,
                  { 
                    color: selectedCategory === category ? 'white' : themeColors.textPrimary,
                  }
                ]}>
                  {label} ({count})
                </Text>
              </TouchableOpacity>
            ))}
            </ScrollView>
          </View>

          {/* Track List */}
          <ScrollView style={styles.trackList}>
            {/* No Music Option */}
            <TouchableOpacity
              style={[styles.trackItem, { borderBottomColor: themeColors.border }]}
              onPress={handleNoMusicSelect}
            >
              <View style={styles.trackInfo}>
                <Icon name="volume-off" size={16} color={themeColors.textSecondary} />
                <View style={styles.trackDetails}>
                  <Text style={[styles.trackTitle, { color: themeColors.textPrimary }]}>
                    Silent Meditation
                  </Text>
                  <Text style={[styles.trackArtist, { color: themeColors.textSecondary }]}>
                    No background music
                  </Text>
                </View>
              </View>
              {selectedTrack === null && (
                <Icon name="check" size={16} color={brandColors.primary} />
              )}
            </TouchableOpacity>

            {/* Available Tracks */}
            {filteredTracks.map((track) => (
              <TouchableOpacity
                key={track.id}
                style={[styles.trackItem, { borderBottomColor: themeColors.border }]}
                onPress={() => handleTrackSelect(track)}
              >
                <View style={styles.trackInfo}>
                  <Icon 
                    name={getCategoryIcon(track.category)} 
                    size={16} 
                    color={themeColors.textSecondary} 
                  />
                  <View style={styles.trackDetails}>
                    <Text style={[styles.trackTitle, { color: themeColors.textPrimary }]}>
                      {track.title}
                    </Text>
                    <Text style={[styles.trackArtist, { color: themeColors.textSecondary }]}>
                      {track.artist} • {track.category}
                    </Text>
                  </View>
                </View>
                {selectedTrack?.id === track.id && (
                  <Icon name="check" size={16} color={brandColors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  selectorButton: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorText: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    flex: 1,
    marginLeft: 12,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    ...TYPOGRAPHY.HEADING_SMALL,
    fontWeight: '600',
  },
  closeButton: {
    padding: 8,
  },
  categoryFilterWrapper: {
    paddingVertical: 16,
  },
  categoryFilter: {
    flexGrow: 0,
  },
  categoryFilterContent: {
    paddingHorizontal: 20,
    paddingRight: 40, // Extra padding to prevent cutoff
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 12,
    minWidth: 80, // Ensure minimum width
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryButtonText: {
    ...TYPOGRAPHY.BODY_SMALL,
    fontWeight: '500',
  },
  trackList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    borderBottomWidth: 1,
    minHeight: 60, // Ensure consistent height
  },
  trackInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  trackDetails: {
    marginLeft: 12,
    flex: 1,
  },
  trackTitle: {
    ...TYPOGRAPHY.BODY_MEDIUM,
    fontWeight: '500',
    marginBottom: 2,
  },
  trackArtist: {
    ...TYPOGRAPHY.BODY_SMALL,
    textTransform: 'capitalize',
  },
});

export default MeditationMusicSelector;
