import { configureStore } from '@reduxjs/toolkit';
import recommendationReducer, {
  fetchRecommendations,
  fetchRecommendationReason,
  fetchRecommendationsByTime,
  fetchRecommendationsByEmotion,
  clearRecommendations,
  clearError,
} from '@/store/recommendationSlice';
import { apiService } from '@/services/api';

jest.mock('@/services/api');

describe('recommendationSlice', () => {
  let store: any;

  beforeEach(() => {
    store = configureStore({
      reducer: {
        recommendations: recommendationReducer,
      },
    });
    jest.clearAllMocks();
  });

  describe('fetchRecommendations', () => {
    it('should set loading state when fetching', () => {
      // Arrange
      const mockFetch = jest.fn().mockReturnValue(
        new Promise(() => {}) // Never resolves
      );
      (apiService.getPersonalizedRecommendations as jest.Mock) = mockFetch;

      // Act
      store.dispatch(fetchRecommendations(3));

      // Assert
      const state = store.getState().recommendations;
      expect(state.loading).toBe(true);
    });

    it('should set recommendations on success', async () => {
      // Arrange
      const mockRecommendations = [
        {
          title: 'Morning Mindfulness',
          theme: 'mindfulness',
          difficulty: 'beginner',
          duration: 10,
          reason: 'Based on your preference',
        },
        {
          title: 'Stress Relief',
          theme: 'stress-relief',
          difficulty: 'intermediate',
          duration: 15,
          reason: 'Matches your favorite sessions',
        },
      ];

      (apiService.getPersonalizedRecommendations as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRecommendations,
      });

      // Act
      await store.dispatch(fetchRecommendations(2));

      // Assert
      const state = store.getState().recommendations;
      expect(state.loading).toBe(false);
      expect(state.recommendations).toEqual(mockRecommendations);
      expect(state.error).toBeNull();
    });

    it('should set error on failure', async () => {
      // Arrange
      (apiService.getPersonalizedRecommendations as jest.Mock).mockResolvedValue({
        success: false,
        error: { message: 'Failed to fetch recommendations' },
      });

      // Act
      await store.dispatch(fetchRecommendations(3));

      // Assert
      const state = store.getState().recommendations;
      expect(state.loading).toBe(false);
      expect(state.error).toBeTruthy();
      expect(state.recommendations).toEqual([]);
    });
  });

  describe('fetchRecommendationReason', () => {
    it('should fetch reason for a session', async () => {
      // Arrange
      const sessionTitle = 'Morning Mindfulness';
      const mockReason = 'Based on your preference for mindfulness sessions';

      (apiService.getRecommendationReason as jest.Mock).mockResolvedValue({
        success: true,
        data: { reason: mockReason },
      });

      // Act
      await store.dispatch(fetchRecommendationReason(sessionTitle));

      // Assert
      expect(apiService.getRecommendationReason).toHaveBeenCalledWith(sessionTitle);
    });
  });

  describe('fetchRecommendationsByTime', () => {
    it('should fetch recommendations for specific time', async () => {
      // Arrange
      const mockRecommendations = [
        {
          title: 'Morning Mindfulness',
          theme: 'mindfulness',
          difficulty: 'beginner',
          duration: 10,
          reason: 'Perfect for morning meditation',
        },
      ];

      (apiService.getRecommendationsByTime as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRecommendations,
      });

      // Act
      await store.dispatch(
        fetchRecommendationsByTime({ timeOfDay: 'morning', count: 3 })
      );

      // Assert
      expect(apiService.getRecommendationsByTime).toHaveBeenCalledWith('morning', 3);
    });
  });

  describe('fetchRecommendationsByEmotion', () => {
    it('should fetch recommendations for emotional state', async () => {
      // Arrange
      const mockRecommendations = [
        {
          title: 'Stress Relief',
          theme: 'stress-relief',
          difficulty: 'intermediate',
          duration: 15,
          reason: 'Perfect for stress relief',
        },
      ];

      (apiService.getRecommendationsByEmotion as jest.Mock).mockResolvedValue({
        success: true,
        data: mockRecommendations,
      });

      // Act
      await store.dispatch(
        fetchRecommendationsByEmotion({ emotionalState: 'stressed', count: 3 })
      );

      // Assert
      expect(apiService.getRecommendationsByEmotion).toHaveBeenCalledWith(
        'stressed',
        3
      );
    });
  });

  describe('clearRecommendations', () => {
    it('should clear all recommendations', () => {
      // Arrange
      const initialState = {
        recommendations: [
          {
            title: 'Morning Mindfulness',
            theme: 'mindfulness',
            difficulty: 'beginner',
            duration: 10,
            reason: 'Based on your preference',
          },
        ],
        loading: false,
        error: null,
        lastFetchTime: Date.now(),
        cacheExpiry: 3600000,
      };

      store = configureStore({
        reducer: {
          recommendations: recommendationReducer,
        },
        preloadedState: {
          recommendations: initialState,
        },
      });

      // Act
      store.dispatch(clearRecommendations());

      // Assert
      const state = store.getState().recommendations;
      expect(state.recommendations).toEqual([]);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      // Arrange
      const initialState = {
        recommendations: [],
        loading: false,
        error: 'Some error occurred',
        lastFetchTime: null,
        cacheExpiry: 3600000,
      };

      store = configureStore({
        reducer: {
          recommendations: recommendationReducer,
        },
        preloadedState: {
          recommendations: initialState,
        },
      });

      // Act
      store.dispatch(clearError());

      // Assert
      const state = store.getState().recommendations;
      expect(state.error).toBeNull();
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      // Act
      const state = store.getState().recommendations;

      // Assert
      expect(state.recommendations).toEqual([]);
      expect(state.loading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.lastFetchTime).toBeNull();
      expect(state.cacheExpiry).toBe(3600000); // 1 hour
    });
  });
});

