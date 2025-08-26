import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoveButton } from '@/components/shared';
import { CommentButton } from '@/components/shared';
import { ShareButton } from '@/components/shared';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { Quote } from '@/services/quotesService';

interface QuoteCardBottomControlsProps {
  quote: Quote;
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onToggleLike: () => void;
}

const QuoteCardBottomControls: React.FC<QuoteCardBottomControlsProps> = ({
  quote,
  isLiked,
  likeCount,
  commentCount,
  onToggleLike,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);

  const handleCommentPress = () => {
    console.log('Comment pressed for quote:', quote.text);
  };

  const handleSharePress = () => {
    console.log('Share pressed for quote:', quote.text);
  };

  return (
    <View style={styles.container}>
      <LoveButton 
        isLiked={isLiked} 
        onPress={onToggleLike} 
        likeCount={likeCount} 
        isDarkMode={isDarkMode}
      />
      
      <CommentButton 
        commentCount={commentCount}
        onPress={handleCommentPress}
        isDarkMode={isDarkMode}
      />
      
      <ShareButton 
        onPress={handleSharePress}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    marginBottom: 16,
    gap: 16,
  },
});

export default QuoteCardBottomControls;
