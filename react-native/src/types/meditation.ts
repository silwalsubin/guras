// Guided Meditation Types and Interfaces

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';
export type MeditationTheme = 'stress-relief' | 'sleep' | 'focus' | 'anxiety' | 'gratitude' | 'mindfulness' | 'compassion' | 'body-scan';
export type ProgramDuration = 7 | 21 | 30;

export interface Teacher {
  id: string;
  name: string;
  bio: string;
  avatar?: string;
  voiceStyle: string; // e.g., "Calm and soothing", "Energetic and motivating"
  specialties: MeditationTheme[];
  totalSessions: number;
  rating: number;
  yearsExperience: number;
}

export interface GuidedMeditationSession {
  id: string;
  title: string;
  description: string;
  teacher: Teacher;
  duration: number; // in minutes
  theme: MeditationTheme;
  difficulty: DifficultyLevel;
  audioUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  rating: number;
  completionCount: number;
  isNew?: boolean;
  isFeatured?: boolean;
  programId?: string; // If part of a program
  programDay?: number; // Day number in program
}

export interface MeditationProgram {
  id: string;
  title: string;
  description: string;
  duration: ProgramDuration; // 7, 21, or 30 days
  theme: MeditationTheme;
  difficulty: DifficultyLevel;
  teacher: Teacher;
  thumbnailUrl?: string;
  sessions: GuidedMeditationSession[];
  totalParticipants: number;
  rating: number;
  benefits: string[];
  isEnrolled?: boolean;
  currentDay?: number; // User's current progress
  completedDays?: number[];
}

export interface UserMeditationProgress {
  sessionId: string;
  completed: boolean;
  completedAt?: string;
  rating?: number;
  notes?: string;
  mood?: {
    before: number;
    after: number;
  };
}

export interface MeditationLibraryFilters {
  themes: MeditationTheme[];
  difficulties: DifficultyLevel[];
  teachers: string[]; // teacher IDs
  duration: {
    min: number;
    max: number;
  };
  showOnlyNew?: boolean;
  showOnlyFeatured?: boolean;
}

export interface MeditationStats {
  totalGuidedSessions: number;
  totalGuidedMinutes: number;
  completedPrograms: number;
  currentStreak: number;
  favoriteTeacher?: Teacher;
  favoriteTheme?: MeditationTheme;
  averageRating: number;
}
