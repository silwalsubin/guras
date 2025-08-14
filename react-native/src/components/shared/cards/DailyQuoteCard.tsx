import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { BaseCard } from '@/components/shared';
import { QuoteCardBottomControls } from '@/components/shared';
import { MoreOptionsButton } from '@/components/shared';
import quotesService, { Quote } from '@/services/quotesService';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

const { width: screenWidth } = Dimensions.get('window');

const DailyQuoteCard: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState<Set<number>>(new Set());
  const [likeCount, setLikeCount] = useState(42); // Mock initial like count
  const [commentCount, setCommentCount] = useState(7); // Mock initial comment count
  
  const currentQuote = quotes[currentIndex] || null;
  const isCurrentQuoteLiked = currentQuote ? likedQuotes.has(currentQuote.id) : false;

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      // Load multiple quotes for the carousel
      const allQuotes = quotesService.getQuotesByCategory('meditation');
      const randomQuotes = Array.from({ length: 8 }, () => quotesService.getRandomQuote());
      const uniqueQuotes = [...new Map([...allQuotes, ...randomQuotes].map(q => [q.id, q])).values()];
      setQuotes(uniqueQuotes);
      
      // Set initial quote
      const initialQuote = await quotesService.updateQuoteIfNeeded();
      if (initialQuote) {
        setQuotes(prev => [initialQuote, ...prev.filter(q => q.id !== initialQuote.id)]);
      }
    } catch (error) {
      console.error('Error loading quotes:', error);
      // Fallback to random quotes
      const fallbackQuotes = Array.from({ length: 5 }, () => quotesService.getRandomQuote());
      setQuotes(fallbackQuotes);
    } finally {
      setLoading(false);
    }
  };

  const goToNextQuote = () => {
    if (quotes.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % quotes.length);
    }
  };

  const goToPreviousQuote = () => {
    if (quotes.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + quotes.length) % quotes.length);
    }
  };

  const toggleLike = () => {
    if (currentQuote) {
      setLikedQuotes(prev => {
        const newLikedQuotes = new Set(prev);
        if (newLikedQuotes.has(currentQuote.id)) {
          newLikedQuotes.delete(currentQuote.id);
          setLikeCount(prev => prev - 1);
        } else {
          newLikedQuotes.add(currentQuote.id);
          setLikeCount(prev => prev + 1);
        }
        return newLikedQuotes;
      });
    }
  };

  if (loading) {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../../../assets/app-logo.png')} 
            style={styles.titleIcon}
          />
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              Loading...
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              Please wait
            </Text>
          </View>
        </View>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading inspiration...
        </Text>
      </BaseCard>
    );
  }

  if (!currentQuote) {
    return (
      <BaseCard style={styles.card}>
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../../../assets/app-logo.png')} 
            style={styles.titleTextContainer}
          />
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              No quotes available
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              Try again later
            </Text>
          </View>
        </View>
        <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>
          No quotes available
        </Text>
      </BaseCard>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <BaseCard style={styles.card}>
        <TouchableOpacity style={[styles.followButton, { backgroundColor: brandColors.primary }]}>
          <Text style={styles.followButtonText}>Follow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.moreOptionsButton}>
          <MoreOptionsButton 
            onPress={() => console.log('More options pressed')}
            isDarkMode={isDarkMode}
          />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Image 
            source={require('../../../../assets/app-logo.png')} 
            style={styles.titleIcon}
          />
          <View style={styles.titleTextContainer}>
            <Text style={[styles.title, { color: themeColors.textPrimary }]}>
              {currentQuote.author}
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              {currentQuote.category.replace('-', ' ')}
            </Text>
          </View>
        </View>
        
        <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
            {currentQuote.text}
          </Text>
        </View>
      </BaseCard>

      {/* Interaction buttons positioned below the card */}
      <QuoteCardBottomControls 
        isLiked={isCurrentQuoteLiked} 
        onLikePress={toggleLike} 
        likeCount={likeCount} 
        commentCount={commentCount}
        onCommentPress={() => console.log('Comment pressed')}
        onSharePress={() => console.log('Share pressed')}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
  },
  card: {
    marginBottom: 8,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: -8,
    marginLeft: -8,
  },
  titleIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  titleTextContainer: {
    flexDirection: 'column',
  },
  title: {
    ...TYPOGRAPHY.BODY_SMALL,
    marginBottom: 1,
    textAlign: 'left',
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  authorText: {
    ...TYPOGRAPHY.CAPTION,
    textAlign: 'left',
    marginBottom: 0,
    textTransform: 'capitalize',
    fontWeight: '400',
    letterSpacing: 0.2,
    opacity: 0.8,
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
    paddingTop: 12,
    paddingBottom: 12,
    borderRadius: 12,
  },
  quoteText: {
    ...TYPOGRAPHY.BODY,
    fontSize: 19,
    lineHeight: 30,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 0,
    fontWeight: '300',
    letterSpacing: 0.6,
    width: '100%',
  },
  categoryText: {
    ...TYPOGRAPHY.CAPTION,
    textAlign: 'center',
    marginBottom: 0,
    textTransform: 'capitalize',
    fontWeight: '500',
  },
  loadingText: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  errorText: {
    ...TYPOGRAPHY.BODY,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  followButton: {
    position: 'absolute',
    top: 16,
    right: 12,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    zIndex: 1,
  },
  followButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  moreOptionsButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    zIndex: 1,
  },
});

export default DailyQuoteCard; 