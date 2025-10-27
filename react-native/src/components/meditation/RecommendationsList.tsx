import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import RecommendationCard, { MeditationRecommendation } from './RecommendationCard';
import { recommendationAnalyticsService } from '@/services/recommendationAnalyticsService';
import Icon from 'react-native-vector-icons/FontAwesome';

interface RecommendationsListProps {
  recommendations: MeditationRecommendation[];
  onRecommendationPress: (recommendation: MeditationRecommendation) => void;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  compact?: boolean;
  title?: string;
  showHeader?: boolean;
}

const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  onRecommendationPress,
  isLoading = false,
  onRefresh,
  compact = false,
  title = 'Recommended For You',
  showHeader = true,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View
        style={[
          styles.emptyIconContainer,
          { backgroundColor: brandColors.primary + '20' },
        ]}
      >
        <Icon name="lightbulb-o" size={40} color={brandColors.primary} />
      </View>
      <Text style={[styles.emptyTitle, { color: themeColors.textPrimary }]}>
        No Recommendations Yet
      </Text>
      <Text style={[styles.emptySubtitle, { color: themeColors.textSecondary }]}>
        Complete more meditation sessions to get personalized recommendations
      </Text>
    </View>
  );

  const renderLoadingState = () => (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={brandColors.primary} />
      <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
        Generating recommendations...
      </Text>
    </View>
  );

  const renderHeader = () => {
    if (!showHeader) return null;

    return (
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <View
            style={[
              styles.headerIcon,
              { backgroundColor: brandColors.primary + '20' },
            ]}
          >
            <Icon name="star" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerText}>
            <Text style={[styles.headerTitle, { color: themeColors.textPrimary }]}>
              {title}
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: themeColors.textSecondary }]}
            >
              {recommendations.length} session{recommendations.length !== 1 ? 's' : ''} tailored for you
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading && recommendations.length === 0) {
    return renderLoadingState();
  }

  if (!recommendations || recommendations.length === 0) {
    return renderEmptyState();
  }

  const handleCardPress = (recommendation: MeditationRecommendation) => {
    recommendationAnalyticsService.trackRecommendationClick(
      recommendation.title,
      recommendation.theme,
      recommendation.difficulty,
      recommendation.duration,
      { reason: recommendation.reason }
    );
    onRecommendationPress(recommendation);
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={recommendations}
        renderItem={({ item, index }) => {
          useEffect(() => {
            recommendationAnalyticsService.trackRecommendationView(
              item.title,
              item.theme,
              item.difficulty,
              item.duration,
              { position: index, reason: item.reason }
            );
          }, [item, index]);

          return (
            <RecommendationCard
              recommendation={item}
              onPress={handleCardPress}
              compact={compact}
            />
          );
        }}
        keyExtractor={(item, index) => `${item.title}-${index}`}
        scrollEnabled={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={brandColors.primary}
            />
          ) : undefined
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '400',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 16,
  },
});

export default RecommendationsList;

