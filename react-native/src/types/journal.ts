/**
 * Journal Entry Types
 */

export interface Emotion {
  id: string;
  name: string;
  color: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string; // AI-generated short title
  content: string;
  emotions: Emotion[]; // Associated emotions
  createdAt: string; // ISO 8601 string for Redux serialization
  updatedAt: string; // ISO 8601 string for Redux serialization
  isDeleted: boolean;
}

export interface CreateJournalEntryDto {
  content: string;
  // Emotions are determined by AI analysis, not provided by client
}

export interface UpdateJournalEntryDto {
  content?: string;
  // Emotions are determined by AI analysis, not provided by client
}

export interface JournalEntryResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string; // AI-determined mood
  moodScore?: number; // AI-determined mood score (1-5)
  emotions: Emotion[]; // Associated emotions with full data
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

export interface EmotionDetailResponse {
  emotionId: string;
  emotionName: string;
  emotionColor: string;
  count: number;
}

export interface DateRange {
  startDate: string;
  endDate: string;
  periodLabel: string;
}

export interface EmotionStatisticsResponse {
  emotions: EmotionDetailResponse[];
  totalEntries: number;
  calculatedAt: string;
  dateRange: DateRange;
}

