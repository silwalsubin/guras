import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { BaseCard } from '@/components/shared';
import { QuoteCardBottomControls } from '@/components/shared';
import { MoreOptionsButton } from '@/components/shared';
import { getThemeColors, getBrandColors } from '@/config/colors';
import { TYPOGRAPHY } from '@/config/fonts';
import { Quote as QuoteType } from '@/services/quotesService';

interface QuoteProps {
  quote: QuoteType;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  isDarkMode: boolean;
}

const Quote: React.FC<QuoteProps> = ({
  quote,
  isLiked,
  likeCount,
  commentCount,
  onLikePress,
  onCommentPress,
  onSharePress,
  isDarkMode,
}) => {
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  return (
    <View style={styles.quoteCardWrapper}>
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
              {quote.author}
            </Text>
            <Text style={[styles.authorText, { color: themeColors.textSecondary }]}>
              {quote.category.replace('-', ' ')}
            </Text>
          </View>
        </View>
        
        <View style={styles.quoteContainer}>
          <Text style={[styles.quoteText, { color: themeColors.textPrimary }]}>
            {quote.text}
          </Text>
        </View>
      </BaseCard>

      {/* Interaction buttons positioned below the card */}
      <QuoteCardBottomControls 
        isLiked={isLiked} 
        onLikePress={onLikePress} 
        likeCount={likeCount} 
        commentCount={commentCount}
        onCommentPress={onCommentPress}
        onSharePress={onSharePress}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  quoteCardWrapper: {
    marginBottom: 4,
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
    ...TYPOGRAPHY.QUOTE,
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 0,
    fontWeight: '400',
    letterSpacing: 0.6,
    width: '100%',
    fontStyle: 'italic' as const,
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

export default Quote;
