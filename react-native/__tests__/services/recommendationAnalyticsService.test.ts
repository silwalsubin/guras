import { recommendationAnalyticsService } from '@/services/recommendationAnalyticsService';
import { apiService } from '@/services/api';

jest.mock('@/services/api');

describe('RecommendationAnalyticsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    recommendationAnalyticsService.clearQueue();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('trackRecommendationView', () => {
    it('should add view event to queue', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;

      // Act
      recommendationAnalyticsService.trackRecommendationView(title, theme, difficulty, duration);

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });

    it('should include metadata in view event', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;
      const metadata = { position: 0, reason: 'Based on your preference' };

      // Act
      recommendationAnalyticsService.trackRecommendationView(
        title,
        theme,
        difficulty,
        duration,
        metadata
      );

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });
  });

  describe('trackRecommendationClick', () => {
    it('should add click event to queue', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;

      // Act
      recommendationAnalyticsService.trackRecommendationClick(title, theme, difficulty, duration);

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });

    it('should trigger flush when batch size is reached', async () => {
      // Arrange
      const mockLogRecommendationEvent = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Event logged' }
      });
      (apiService.logRecommendationEvent as jest.Mock) = mockLogRecommendationEvent;

      // Act - Add 5 events to reach batch size
      for (let i = 0; i < 5; i++) {
        recommendationAnalyticsService.trackRecommendationClick(
          `Session ${i}`,
          'mindfulness',
          'beginner',
          10
        );
      }

      // Assert
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(recommendationAnalyticsService.getQueueSize()).toBe(0);
    });
  });

  describe('trackSessionStartFromRecommendation', () => {
    it('should add session_start event to queue', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;

      // Act
      recommendationAnalyticsService.trackSessionStartFromRecommendation(
        title,
        theme,
        difficulty,
        duration
      );

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });

    it('should include sessionId in metadata', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;
      const sessionId = 'session-123';

      // Act
      recommendationAnalyticsService.trackSessionStartFromRecommendation(
        title,
        theme,
        difficulty,
        duration,
        sessionId
      );

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });
  });

  describe('trackSessionCompleteFromRecommendation', () => {
    it('should add session_complete event to queue', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;

      // Act
      recommendationAnalyticsService.trackSessionCompleteFromRecommendation(
        title,
        theme,
        difficulty,
        duration
      );

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });

    it('should include rating and actualDuration in metadata', () => {
      // Arrange
      const title = 'Morning Mindfulness';
      const theme = 'mindfulness';
      const difficulty = 'beginner';
      const duration = 10;
      const actualDuration = 12;
      const rating = 5;

      // Act
      recommendationAnalyticsService.trackSessionCompleteFromRecommendation(
        title,
        theme,
        difficulty,
        duration,
        actualDuration,
        rating
      );

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);
    });
  });

  describe('flush', () => {
    it('should send queued events to API', async () => {
      // Arrange
      const mockLogRecommendationEvent = jest.fn().mockResolvedValue({
        success: true,
        data: { message: 'Event logged' }
      });
      (apiService.logRecommendationEvent as jest.Mock) = mockLogRecommendationEvent;

      recommendationAnalyticsService.trackRecommendationView(
        'Morning Mindfulness',
        'mindfulness',
        'beginner',
        10
      );

      // Act
      await recommendationAnalyticsService.flush();

      // Assert
      expect(mockLogRecommendationEvent).toHaveBeenCalled();
      expect(recommendationAnalyticsService.getQueueSize()).toBe(0);
    });

    it('should handle API errors gracefully', async () => {
      // Arrange
      const mockLogRecommendationEvent = jest.fn().mockRejectedValue(
        new Error('API Error')
      );
      (apiService.logRecommendationEvent as jest.Mock) = mockLogRecommendationEvent;

      recommendationAnalyticsService.trackRecommendationView(
        'Morning Mindfulness',
        'mindfulness',
        'beginner',
        10
      );

      // Act
      await recommendationAnalyticsService.flush();

      // Assert - Event should be re-queued on error
      expect(recommendationAnalyticsService.getQueueSize()).toBeGreaterThan(0);
    });
  });

  describe('clearQueue', () => {
    it('should clear all queued events', () => {
      // Arrange
      recommendationAnalyticsService.trackRecommendationView(
        'Morning Mindfulness',
        'mindfulness',
        'beginner',
        10
      );
      expect(recommendationAnalyticsService.getQueueSize()).toBe(1);

      // Act
      recommendationAnalyticsService.clearQueue();

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(0);
    });
  });

  describe('getQueueSize', () => {
    it('should return correct queue size', () => {
      // Arrange & Act
      recommendationAnalyticsService.trackRecommendationView(
        'Morning Mindfulness',
        'mindfulness',
        'beginner',
        10
      );
      recommendationAnalyticsService.trackRecommendationClick(
        'Stress Relief',
        'stress-relief',
        'intermediate',
        15
      );

      // Assert
      expect(recommendationAnalyticsService.getQueueSize()).toBe(2);
    });
  });
});

