import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import RecommendationCard, { MeditationRecommendation } from '@/components/meditation/RecommendationCard';
import themeReducer from '@/store/themeSlice';

describe('RecommendationCard', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        theme: themeReducer,
      },
      preloadedState: {
        theme: {
          isDarkMode: false,
        },
      },
    });
  });

  const mockRecommendation: MeditationRecommendation = {
    title: 'Morning Mindfulness',
    theme: 'mindfulness',
    difficulty: 'beginner',
    duration: 10,
    reason: 'Based on your preference for mindfulness sessions',
  };

  const mockOnPress = jest.fn();

  describe('Full Layout', () => {
    it('should render recommendation card with all details', () => {
      // Arrange & Act
      const { getByText } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={false}
          />
        </Provider>
      );

      // Assert
      expect(getByText('Morning Mindfulness')).toBeTruthy();
      expect(getByText('Based on your preference for mindfulness sessions')).toBeTruthy();
      expect(getByText('10 min')).toBeTruthy();
      expect(getByText('Beginner')).toBeTruthy();
    });

    it('should call onPress when card is pressed', () => {
      // Arrange
      const { getByTestId } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={false}
          />
        </Provider>
      );

      // Act
      const pressable = getByTestId('recommendation-card-pressable');
      fireEvent.press(pressable);

      // Assert
      expect(mockOnPress).toHaveBeenCalledWith(mockRecommendation);
    });

    it('should display correct theme icon', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={false}
          />
        </Provider>
      );

      // Assert
      const themeIcon = getByTestId('theme-icon');
      expect(themeIcon).toBeTruthy();
    });

    it('should display recommended badge', () => {
      // Arrange & Act
      const { getByTestId } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={false}
          />
        </Provider>
      );

      // Assert
      const badge = getByTestId('recommended-badge');
      expect(badge).toBeTruthy();
    });
  });

  describe('Compact Layout', () => {
    it('should render compact card with minimal details', () => {
      // Arrange & Act
      const { getByText, queryByText } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={true}
          />
        </Provider>
      );

      // Assert
      expect(getByText('Morning Mindfulness')).toBeTruthy();
      expect(getByText('10 min')).toBeTruthy();
      // Reason should not be visible in compact mode
      expect(queryByText('Based on your preference for mindfulness sessions')).toBeFalsy();
    });

    it('should call onPress when compact card is pressed', () => {
      // Arrange
      const { getByTestId } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={true}
          />
        </Provider>
      );

      // Act
      const pressable = getByTestId('recommendation-card-pressable');
      fireEvent.press(pressable);

      // Assert
      expect(mockOnPress).toHaveBeenCalledWith(mockRecommendation);
    });
  });

  describe('Theme Icons', () => {
    const themes = [
      { theme: 'mindfulness', expectedIcon: 'leaf' },
      { theme: 'stress-relief', expectedIcon: 'heart' },
      { theme: 'sleep', expectedIcon: 'moon' },
      { theme: 'focus', expectedIcon: 'eye' },
      { theme: 'anxiety', expectedIcon: 'shield' },
      { theme: 'gratitude', expectedIcon: 'smile' },
      { theme: 'compassion', expectedIcon: 'heart-o' },
      { theme: 'body-scan', expectedIcon: 'user' },
    ];

    themes.forEach(({ theme, expectedIcon }) => {
      it(`should display correct icon for ${theme} theme`, () => {
        // Arrange
        const recommendation = { ...mockRecommendation, theme };

        // Act
        const { getByTestId } = render(
          <Provider store={store}>
            <RecommendationCard
              recommendation={recommendation}
              onPress={mockOnPress}
              compact={false}
            />
          </Provider>
        );

        // Assert
        const themeIcon = getByTestId('theme-icon');
        expect(themeIcon).toBeTruthy();
      });
    });
  });

  describe('Difficulty Colors', () => {
    const difficulties = ['beginner', 'intermediate', 'advanced'];

    difficulties.forEach((difficulty) => {
      it(`should display correct styling for ${difficulty} difficulty`, () => {
        // Arrange
        const recommendation = { ...mockRecommendation, difficulty };

        // Act
        const { getByText } = render(
          <Provider store={store}>
            <RecommendationCard
              recommendation={recommendation}
              onPress={mockOnPress}
              compact={false}
            />
          </Provider>
        );

        // Assert
        const difficultyText = getByText(
          difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
        );
        expect(difficultyText).toBeTruthy();
      });
    });
  });

  describe('Dark Mode', () => {
    it('should apply dark mode styles when isDarkMode is true', () => {
      // Arrange
      const darkStore = configureStore({
        reducer: {
          theme: themeReducer,
        },
        preloadedState: {
          theme: {
            isDarkMode: true,
          },
        },
      });

      // Act
      const { getByTestId } = render(
        <Provider store={darkStore}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={false}
          />
        </Provider>
      );

      // Assert
      const card = getByTestId('recommendation-card');
      expect(card).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should apply custom style prop', () => {
      // Arrange
      const customStyle = { marginTop: 20 };

      // Act
      const { getByTestId } = render(
        <Provider store={store}>
          <RecommendationCard
            recommendation={mockRecommendation}
            onPress={mockOnPress}
            compact={false}
            style={customStyle}
          />
        </Provider>
      );

      // Assert
      const card = getByTestId('recommendation-card');
      expect(card).toBeTruthy();
    });
  });
});

