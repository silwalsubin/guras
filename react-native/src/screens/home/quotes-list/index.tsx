import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { BaseCard, HorizontalSeparator } from '../../../components/shared';
import Quote from './quote-card';
import QuoteCardBottomControls from './quote-card/bottom-controls';
import quotesService, { Quote as QuoteType } from '@/services/quotesService';


const QuotesView: React.FC = () => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const [quotes, setQuotes] = useState<QuoteType[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedQuotes, setLikedQuotes] = useState<Set<string>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>({});

  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  useEffect(() => {
    loadQuotes();
  }, []);

  const loadQuotes = async () => {
    try {
      setLoading(true);
      
      // Load all quotes from API
      const allQuotes = await quotesService.getAllQuotes();
      
      setQuotes(allQuotes);
      
      // Initialize like and comment counts for each quote
      const initialLikeCounts: Record<string, number> = {};
      const initialCommentCounts: Record<string, number> = {};
      
      allQuotes.forEach(quote => {
        const quoteKey = `${quote.text}-${quote.author}`;
        initialLikeCounts[quoteKey] = Math.floor(Math.random() * 50) + 10; // Random like count between 10-60
        initialCommentCounts[quoteKey] = Math.floor(Math.random() * 20) + 1; // Random comment count between 1-21
      });
      
      setLikeCounts(initialLikeCounts);
      setCommentCounts(initialCommentCounts);
      
      console.log('✅ Loaded quotes from API:', allQuotes.length);
    } catch (error) {
      console.error('Error loading quotes:', error);
      // Fallback to local quotes
      const fallbackQuotes = await quotesService.getAllQuotes();
      setQuotes(fallbackQuotes);
    } finally {
      setLoading(false);
    }
  };



  const toggleLike = (quote: QuoteType) => {
    const quoteKey = `${quote.text}-${quote.author}`;
    setLikedQuotes(prev => {
      const newLikedQuotes = new Set(prev);
      if (newLikedQuotes.has(quoteKey)) {
        newLikedQuotes.delete(quoteKey);
        setLikeCounts(prev => ({ ...prev, [quoteKey]: (prev[quoteKey] || 42) - 1 }));
      } else {
        newLikedQuotes.add(quoteKey);
        setLikeCounts(prev => ({ ...prev, [quoteKey]: (prev[quoteKey] || 42) + 1 }));
      }
      return newLikedQuotes;
    });
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

  if (quotes.length === 0) {
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
      {quotes.map((quote, index) => {
        const quoteKey = `${quote.text}-${quote.author}`;
        const isLiked = likedQuotes.has(quoteKey);
        const likeCount = likeCounts[quoteKey] || 42;
        const commentCount = commentCounts[quoteKey] || 7;
        
        return (
          <View key={quoteKey}>
            <Quote
              quote={quote}
              isLiked={isLiked}
              likeCount={likeCount}
              commentCount={commentCount}
              onLikePress={() => toggleLike(quote)}
              onCommentPress={() => console.log('Comment pressed')}
              onSharePress={() => console.log('Share pressed')}
              isDarkMode={isDarkMode}
            />
            {index < quotes.length - 1 && (
              <HorizontalSeparator />
            )}
          </View>
        );
      })}
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

export default QuotesView;
