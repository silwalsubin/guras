/**
 * Journal Entry Types
 */

export interface JournalEntry {
  id: string;
  userId: string;
  title: string; // AI-generated short title
  content: string;
  mood?: string; // e.g., 'happy', 'sad', 'anxious', 'calm', 'neutral'
  moodScore?: number; // 1-10 scale
  tags: string[];
  createdAt: string; // ISO 8601 string for Redux serialization
  updatedAt: string; // ISO 8601 string for Redux serialization
  isDeleted: boolean;
}

export interface CreateJournalEntryDto {
  content: string;
  mood?: string;
  moodScore?: number;
  tags?: string[];
}

export interface UpdateJournalEntryDto {
  content?: string;
  mood?: string;
  moodScore?: number;
  tags?: string[];
}

export interface JournalEntryResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string;
  moodScore?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

