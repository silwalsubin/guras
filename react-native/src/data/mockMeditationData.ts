import { 
  Teacher, 
  GuidedMeditationSession, 
  MeditationProgram, 
  UserMeditationProgress,
  MeditationStats,
  DifficultyLevel,
  MeditationTheme 
} from '../types/meditation';

// Mock Teachers
export const mockTeachers: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Sarah Chen',
    bio: 'A mindfulness expert with over 10 years of experience in meditation and stress reduction techniques.',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    voiceStyle: 'Calm and soothing',
    specialties: ['mindfulness', 'stress-relief', 'anxiety'],
    totalSessions: 45,
    rating: 4.8,
    yearsExperience: 10,
  },
  {
    id: 'teacher-2',
    name: 'Marcus Johnson',
    bio: 'Former monk turned meditation teacher, specializing in traditional mindfulness and compassion practices.',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    voiceStyle: 'Deep and grounding',
    specialties: ['compassion', 'mindfulness', 'body-scan'],
    totalSessions: 38,
    rating: 4.9,
    yearsExperience: 15,
  },
  {
    id: 'teacher-3',
    name: 'Emma Rodriguez',
    bio: 'Sleep specialist and meditation teacher focused on helping people achieve better rest and relaxation.',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    voiceStyle: 'Gentle and nurturing',
    specialties: ['sleep', 'stress-relief', 'body-scan'],
    totalSessions: 32,
    rating: 4.7,
    yearsExperience: 8,
  },
  {
    id: 'teacher-4',
    name: 'David Kim',
    bio: 'Focus and productivity coach who combines meditation with cognitive enhancement techniques.',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    voiceStyle: 'Clear and motivating',
    specialties: ['focus', 'mindfulness', 'stress-relief'],
    totalSessions: 28,
    rating: 4.6,
    yearsExperience: 6,
  },
  {
    id: 'teacher-5',
    name: 'Lisa Thompson',
    bio: 'Gratitude and positive psychology expert helping people cultivate appreciation and joy.',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face',
    voiceStyle: 'Warm and uplifting',
    specialties: ['gratitude', 'compassion', 'mindfulness'],
    totalSessions: 25,
    rating: 4.8,
    yearsExperience: 7,
  },
];

// Mock Guided Meditation Sessions
export const mockGuidedSessions: GuidedMeditationSession[] = [
  {
    id: 'session-1',
    title: 'Morning Mindfulness',
    description: 'Start your day with clarity and intention through this gentle morning meditation.',
    teacher: mockTeachers[0],
    duration: 10,
    theme: 'mindfulness',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/morning-mindfulness.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    tags: ['morning', 'clarity', 'intention'],
    rating: 4.7,
    completionCount: 1250,
    isNew: true,
    isFeatured: true,
  },
  {
    id: 'session-2',
    title: 'Deep Sleep Relaxation',
    description: 'Drift into peaceful sleep with this calming bedtime meditation.',
    teacher: mockTeachers[2],
    duration: 20,
    theme: 'sleep',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/deep-sleep.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=200&fit=crop',
    tags: ['bedtime', 'relaxation', 'peaceful'],
    rating: 4.9,
    completionCount: 2100,
    isFeatured: true,
  },
  {
    id: 'session-3',
    title: 'Stress Relief Breathing',
    description: 'Release tension and anxiety with focused breathing techniques.',
    teacher: mockTeachers[0],
    duration: 15,
    theme: 'stress-relief',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/stress-relief.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=200&fit=crop',
    tags: ['breathing', 'tension', 'calm'],
    rating: 4.6,
    completionCount: 1800,
  },
  {
    id: 'session-4',
    title: 'Focus Enhancement',
    description: 'Sharpen your concentration and mental clarity for better productivity.',
    teacher: mockTeachers[3],
    duration: 12,
    theme: 'focus',
    difficulty: 'intermediate',
    audioUrl: 'https://example.com/focus-enhancement.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop',
    tags: ['concentration', 'productivity', 'clarity'],
    rating: 4.5,
    completionCount: 950,
  },
  {
    id: 'session-5',
    title: 'Anxiety Relief',
    description: 'Find peace and calm in moments of worry and overwhelm.',
    teacher: mockTeachers[0],
    duration: 18,
    theme: 'anxiety',
    difficulty: 'intermediate',
    audioUrl: 'https://example.com/anxiety-relief.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=300&h=200&fit=crop',
    tags: ['worry', 'calm', 'peace'],
    rating: 4.8,
    completionCount: 1650,
  },
  {
    id: 'session-6',
    title: 'Gratitude Practice',
    description: 'Cultivate appreciation and joy through guided gratitude meditation.',
    teacher: mockTeachers[4],
    duration: 14,
    theme: 'gratitude',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/gratitude-practice.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=200&fit=crop',
    tags: ['appreciation', 'joy', 'thankfulness'],
    rating: 4.7,
    completionCount: 1100,
    isNew: true,
  },
  {
    id: 'session-7',
    title: 'Body Scan Relaxation',
    description: 'Release physical tension through systematic body awareness.',
    teacher: mockTeachers[1],
    duration: 25,
    theme: 'body-scan',
    difficulty: 'intermediate',
    audioUrl: 'https://example.com/body-scan.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=200&fit=crop',
    tags: ['tension', 'awareness', 'relaxation'],
    rating: 4.6,
    completionCount: 850,
  },
  {
    id: 'session-8',
    title: 'Loving Kindness',
    description: 'Develop compassion for yourself and others through loving-kindness meditation.',
    teacher: mockTeachers[1],
    duration: 16,
    theme: 'compassion',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/loving-kindness.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=300&h=200&fit=crop',
    tags: ['compassion', 'kindness', 'love'],
    rating: 4.8,
    completionCount: 1300,
  },
  {
    id: 'session-9',
    title: 'Advanced Mindfulness',
    description: 'Deepen your mindfulness practice with advanced techniques.',
    teacher: mockTeachers[1],
    duration: 30,
    theme: 'mindfulness',
    difficulty: 'advanced',
    audioUrl: 'https://example.com/advanced-mindfulness.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    tags: ['advanced', 'depth', 'awareness'],
    rating: 4.9,
    completionCount: 650,
  },
  {
    id: 'session-10',
    title: 'Quick Stress Reset',
    description: 'A quick 5-minute meditation to reset your stress levels.',
    teacher: mockTeachers[0],
    duration: 5,
    theme: 'stress-relief',
    difficulty: 'beginner',
    audioUrl: 'https://example.com/quick-stress-reset.mp3',
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=200&fit=crop',
    tags: ['quick', 'reset', 'emergency'],
    rating: 4.4,
    completionCount: 2200,
    isNew: true,
  },
];

// Mock Meditation Programs
export const mockMeditationPrograms: MeditationProgram[] = [
  {
    id: 'program-1',
    title: '7 Days of Mindfulness',
    description: 'Build a foundation of mindfulness practice with daily guided sessions.',
    duration: 7,
    theme: 'mindfulness',
    difficulty: 'beginner',
    teacher: mockTeachers[0],
    thumbnailUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=200&fit=crop',
    sessions: [], // Will be populated with specific program sessions
    totalParticipants: 15420,
    rating: 4.8,
    benefits: [
      'Develop daily meditation habit',
      'Reduce stress and anxiety',
      'Improve focus and clarity',
      'Better emotional regulation'
    ],
    isEnrolled: false,
    currentDay: 0,
    completedDays: [],
  },
  {
    id: 'program-2',
    title: '21-Day Stress Relief Challenge',
    description: 'Transform your relationship with stress through proven meditation techniques.',
    duration: 21,
    theme: 'stress-relief',
    difficulty: 'intermediate',
    teacher: mockTeachers[0],
    thumbnailUrl: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=300&h=200&fit=crop',
    sessions: [],
    totalParticipants: 8750,
    rating: 4.7,
    benefits: [
      'Master stress management techniques',
      'Build resilience to daily pressures',
      'Improve sleep quality',
      'Enhance overall well-being'
    ],
    isEnrolled: true,
    currentDay: 5,
    completedDays: [1, 2, 3, 4],
  },
  {
    id: 'program-3',
    title: '30-Day Sleep Transformation',
    description: 'Achieve deeper, more restful sleep through specialized meditation practices.',
    duration: 30,
    theme: 'sleep',
    difficulty: 'beginner',
    teacher: mockTeachers[2],
    thumbnailUrl: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=300&h=200&fit=crop',
    sessions: [],
    totalParticipants: 12300,
    rating: 4.9,
    benefits: [
      'Fall asleep faster',
      'Improve sleep quality',
      'Reduce nighttime anxiety',
      'Wake up more refreshed'
    ],
    isEnrolled: false,
    currentDay: 0,
    completedDays: [],
  },
  {
    id: 'program-4',
    title: '21-Day Focus Mastery',
    description: 'Enhance your concentration and productivity through targeted meditation.',
    duration: 21,
    theme: 'focus',
    difficulty: 'intermediate',
    teacher: mockTeachers[3],
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop',
    sessions: [],
    totalParticipants: 6890,
    rating: 4.6,
    benefits: [
      'Sharpen mental focus',
      'Increase productivity',
      'Reduce mental distractions',
      'Enhance cognitive performance'
    ],
    isEnrolled: false,
    currentDay: 0,
    completedDays: [],
  },
];

// Mock User Progress Data
export const mockUserProgress: UserMeditationProgress[] = [
  {
    sessionId: 'session-1',
    completed: true,
    completedAt: '2025-01-20T08:30:00Z',
    rating: 5,
    mood: { before: 3, after: 4 },
  },
  {
    sessionId: 'session-2',
    completed: true,
    completedAt: '2025-01-19T22:15:00Z',
    rating: 5,
    mood: { before: 2, after: 4 },
  },
  {
    sessionId: 'session-3',
    completed: true,
    completedAt: '2025-01-18T14:20:00Z',
    rating: 4,
    mood: { before: 2, after: 3 },
  },
  {
    sessionId: 'session-6',
    completed: true,
    completedAt: '2025-01-17T07:45:00Z',
    rating: 5,
    mood: { before: 3, after: 5 },
  },
];

// Mock Meditation Stats
export const mockMeditationStats: MeditationStats = {
  totalGuidedSessions: 24,
  totalGuidedMinutes: 380,
  completedPrograms: 1,
  currentStreak: 7,
  favoriteTeacher: mockTeachers[0],
  favoriteTheme: 'mindfulness',
  averageRating: 4.6,
};

// Helper functions for filtering and categorization
export const getSessionsByTheme = (theme: MeditationTheme): GuidedMeditationSession[] => {
  return mockGuidedSessions.filter(session => session.theme === theme);
};

export const getSessionsByDifficulty = (difficulty: DifficultyLevel): GuidedMeditationSession[] => {
  return mockGuidedSessions.filter(session => session.difficulty === difficulty);
};

export const getSessionsByTeacher = (teacherId: string): GuidedMeditationSession[] => {
  return mockGuidedSessions.filter(session => session.teacher.id === teacherId);
};

export const getFeaturedSessions = (): GuidedMeditationSession[] => {
  return mockGuidedSessions.filter(session => session.isFeatured);
};

export const getNewSessions = (): GuidedMeditationSession[] => {
  return mockGuidedSessions.filter(session => session.isNew);
};

export const getEnrolledPrograms = (): MeditationProgram[] => {
  return mockMeditationPrograms.filter(program => program.isEnrolled);
};

export const getAvailablePrograms = (): MeditationProgram[] => {
  return mockMeditationPrograms.filter(program => !program.isEnrolled);
};
