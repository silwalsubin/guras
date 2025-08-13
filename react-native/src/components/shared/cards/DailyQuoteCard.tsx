import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, TouchableOpacity, Dimensions, View } from 'react-native';
import { useSelector } from 'react-redux';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { RootState } from '@/store';
import BaseCard from './BaseCard';
import quotesService, { Quote } from '@/services/quotesService';
import { LoveButton } from '@/components/shared';
import { CommentButton } from '@/components/shared';

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
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          ✨ Daily Wisdom
        </Text>
        <Text style={[styles.loadingText, { color: themeColors.textSecondary }]}>
          Loading inspiration...
        </Text>
      </BaseCard>
    );
  }

  if (!currentQuote || quotes.length === 0) {
    return (
      <BaseCard style={styles.card}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          ✨ Daily Wisdom
        </Text>
        <Text style={[styles.errorText, { color: themeColors.textSecondary }]}>
          No quotes available
        </Text>
      </BaseCard>
    );
  }

  return (
    <View style={styles.cardContainer}>
      <BaseCard style={styles.card}>
        <Text style={[styles.title, { color: themeColors.textPrimary }]}>
          ✨ Daily Wisdom
        </Text>
        
        <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
            "{currentQuote.text}"
          </Text>
          
          <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
            — {currentQuote.author}
          </Text>
          
          <Text style={[styles.categoryText, { color: brandColors.primary }]}>
            #{currentQuote.category.replace('-', ' ')}
          </Text>
        </View>
      </BaseCard>

      {/* Like button positioned below the card */}
      <View style={styles.likeButtonContainer}>
        <LoveButton 
          isLiked={isCurrentQuoteLiked} 
          onPress={toggleLike} 
          likeCount={likeCount} 
          isDarkMode={isDarkMode}
        />
        
        <CommentButton 
          commentCount={commentCount}
          onPress={() => console.log('Comment pressed')}
          isDarkMode={isDarkMode}
        />
      </View>
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
  title: {
    ...TYPOGRAPHY.H6,
    marginBottom: 16,
    textAlign: 'center',
  },
  quoteContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  quoteText: {
    ...TYPOGRAPHY.BODY,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 12,
  },
  authorText: {
    ...TYPOGRAPHY.BODY_SMALL,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: '500',
  },
  categoryText: {
    ...TYPOGRAPHY.CAPTION,
    textAlign: 'center',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  likeButtonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 0,
    gap: 20,
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
});

export default DailyQuoteCard; 