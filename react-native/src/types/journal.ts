/**
 * Journal Entry Types
 */

export interface JournalEntry {
  id: string;
  userId: string;
  title: string; // AI-generated short title
  content: string;
  mood?: string; // AI-determined mood
  moodScore?: number; // AI-determined mood score (1-5)
  tags: string[];
  createdAt: string; // ISO 8601 string for Redux serialization
  updatedAt: string; // ISO 8601 string for Redux serialization
  isDeleted: boolean;
}

export interface CreateJournalEntryDto {
  content: string;
  tags?: string[];
}

export interface UpdateJournalEntryDto {
  content?: string;
  tags?: string[];
}

export interface JournalEntryResponse {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: string; // AI-determined mood
  moodScore?: number; // AI-determined mood score (1-5)
  tags: string[];
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
}

