import { apiService } from './api';

export interface RecommendationAnalyticsEvent {
  eventType: 'view' | 'click' | 'session_start' | 'session_complete';
  recommendationTitle: string;
  recommendationTheme: string;
  recommendationDifficulty: string;
  recommendationDuration: number;
  timestamp: string;
  metadata?: Record<string, any>;
}

class RecommendationAnalyticsService {
  private eventQueue: RecommendationAnalyticsEvent[] = [];
  private isProcessing = false;
  private batchSize = 5;
  private flushInterval = 30000; // 30 seconds
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.startAutoFlush();
  }

  private startAutoFlush() {
    this.flushTimer = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flush();
      }
    }, this.flushInterval);
  }

  private stopAutoFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  private addEvent(event: RecommendationAnalyticsEvent) {
    this.eventQueue.push(event);
    console.log(`📊 Recommendation event queued: ${event.eventType} - ${event.recommendationTitle}`);

    if (this.eventQueue.length >= this.batchSize) {
      this.flush();
    }
  }

  async flush() {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;
    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      console.log(`📤 Flushing ${eventsToSend.length} recommendation analytics events`);

      for (const event of eventsToSend) {
        await this.sendEvent(event);
      }

      console.log(`✅ Successfully flushed ${eventsToSend.length} events`);
    } catch (error) {
      console.error('Error flushing recommendation analytics:', error);
      this.eventQueue.unshift(...eventsToSend);
    } finally {
      this.isProcessing = false;
    }
  }

  private async sendEvent(event: RecommendationAnalyticsEvent) {
    try {
      console.log(`📊 Sending recommendation analytics event: ${event.eventType}`);

      const response = await apiService.logRecommendationEvent(event);

      if (!response.success) {
        console.error('Failed to log recommendation event:', response.error);
        throw new Error(response.error?.message || 'Failed to log event');
      }

      console.log(`✅ Recommendation event logged: ${event.eventType}`);
    } catch (error) {
      console.error('Error sending recommendation event:', error);
      throw error;
    }
  }

  trackRecommendationView(
    title: string,
    theme: string,
    difficulty: string,
    duration: number,
    metadata?: Record<string, any>
  ) {
    const event: RecommendationAnalyticsEvent = {
      eventType: 'view',
      recommendationTitle: title,
      recommendationTheme: theme,
      recommendationDifficulty: difficulty,
      recommendationDuration: duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.addEvent(event);
  }

  trackRecommendationClick(
    title: string,
    theme: string,
    difficulty: string,
    duration: number,
    metadata?: Record<string, any>
  ) {
    const event: RecommendationAnalyticsEvent = {
      eventType: 'click',
      recommendationTitle: title,
      recommendationTheme: theme,
      recommendationDifficulty: difficulty,
      recommendationDuration: duration,
      timestamp: new Date().toISOString(),
      metadata,
    };

    this.addEvent(event);
  }

  trackSessionStartFromRecommendation(
    title: string,
    theme: string,
    difficulty: string,
    duration: number,
    sessionId?: string,
    metadata?: Record<string, any>
  ) {
    const event: RecommendationAnalyticsEvent = {
      eventType: 'session_start',
      recommendationTitle: title,
      recommendationTheme: theme,
      recommendationDifficulty: difficulty,
      recommendationDuration: duration,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        sessionId,
      },
    };

    this.addEvent(event);
  }

  trackSessionCompleteFromRecommendation(
    title: string,
    theme: string,
    difficulty: string,
    duration: number,
    actualDuration?: number,
    rating?: number,
    sessionId?: string,
    metadata?: Record<string, any>
  ) {
    const event: RecommendationAnalyticsEvent = {
      eventType: 'session_complete',
      recommendationTitle: title,
      recommendationTheme: theme,
      recommendationDifficulty: difficulty,
      recommendationDuration: duration,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        actualDuration,
        rating,
        sessionId,
      },
    };

    this.addEvent(event);
  }

  async flushAndCleanup() {
    this.stopAutoFlush();
    await this.flush();
  }

  getQueueSize(): number {
    return this.eventQueue.length;
  }

  clearQueue() {
    this.eventQueue = [];
    console.log('Recommendation analytics queue cleared');
  }
}

export const recommendationAnalyticsService = new RecommendationAnalyticsService();

