import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LoveButton } from '@/components/shared';
import { CommentButton } from '@/components/shared';
import { ShareButton } from '@/components/shared';

interface QuoteCardBottomControlsProps {
  isLiked: boolean;
  likeCount: number;
  commentCount: number;
  onLikePress: () => void;
  onCommentPress: () => void;
  onSharePress: () => void;
  isDarkMode?: boolean;
}

const QuoteCardBottomControls: React.FC<QuoteCardBottomControlsProps> = ({
  isLiked,
  likeCount,
  commentCount,
  onLikePress,
  onCommentPress,
  onSharePress,
  isDarkMode = false,
}) => {
  return (
    <View style={styles.container}>
      <LoveButton 
        isLiked={isLiked} 
        onPress={onLikePress} 
        likeCount={likeCount} 
        isDarkMode={isDarkMode}
      />
      
      <CommentButton 
        commentCount={commentCount}
        onPress={onCommentPress}
        isDarkMode={isDarkMode}
      />
      
      <ShareButton 
        onPress={onSharePress}
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
    marginBottom: 0,
    gap: 16,
  },
});

export default QuoteCardBottomControls;
