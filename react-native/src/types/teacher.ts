// Teacher Following and Personalization Types

export interface TeacherFollow {
  id: string;
  userId: string;
  teacherId: string;
  teacherType: 'spiritual' | 'meditation';
  followedAt: string;
  isActive: boolean;
  notificationSettings: TeacherNotificationSettings;
  personalization: TeacherPersonalization;
}

export interface TeacherNotificationSettings {
  newContent: boolean;
  dailyGuidance: boolean;
  liveSessions: boolean;
  weeklyDigest: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
  quietHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
  };
}

export interface TeacherPersonalization {
  interests: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  preferredContentTypes: ('teachings' | 'practices' | 'quotes' | 'sessions')[];
  learningGoals: string[];
  timePreferences: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
  };
  sessionLength: 'short' | 'medium' | 'long'; // 5-15min, 15-30min, 30+min
}

export interface TeacherContent {
  id: string;
  teacherId: string;
  teacherType: 'spiritual' | 'meditation';
  type: 'teaching' | 'practice' | 'quote' | 'session' | 'article' | 'video';
  title: string;
  content: string;
  description?: string;
  category: string;
  tags: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration?: number; // in minutes
  publishedAt: string;
  popularity: number;
  userRating: number;
  isPremium: boolean;
  isFeatured: boolean;
  thumbnail?: string;
  audioUrl?: string;
  videoUrl?: string;
  relatedContent: string[];
}

export interface TeacherFeed {
  id: string;
  userId: string;
  teacherId: string;
  content: TeacherContent[];
  lastUpdated: string;
  hasNewContent: boolean;
  unreadCount: number;
}

export interface TeacherRecommendation {
  id: string;
  userId: string;
  teacherId: string;
  reason: string;
  confidence: number; // 0-1
  basedOn: ('similar_users' | 'content_preferences' | 'learning_goals' | 'activity_pattern')[];
  createdAt: string;
  expiresAt?: string;
}

export interface TeacherInsight {
  id: string;
  userId: string;
  teacherId: string;
  type: 'progress' | 'milestone' | 'recommendation' | 'achievement';
  title: string;
  description: string;
  data: Record<string, any>;
  createdAt: string;
  isRead: boolean;
  actionRequired: boolean;
  actionUrl?: string;
}

export interface TeacherStats {
  teacherId: string;
  totalFollowers: number;
  totalContent: number;
  totalSessions: number;
  averageRating: number;
  engagementRate: number;
  growthRate: number;
  topCategories: string[];
  recentActivity: {
    type: 'new_content' | 'live_session' | 'milestone' | 'achievement';
    title: string;
    timestamp: string;
  }[];
}

export interface TeacherSearchFilters {
  type?: 'spiritual' | 'meditation' | 'all';
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  rating?: number;
  followers?: {
    min?: number;
    max?: number;
  };
  language?: string;
  isLive?: boolean;
  hasFreeContent?: boolean;
  tags?: string[];
}

export interface TeacherSearchResult {
  teacher: any; // SpiritualTeacher or Teacher
  relevanceScore: number;
  matchReasons: string[];
  isFollowing: boolean;
  recommended: boolean;
  distance?: number; // for location-based results
}

export interface TeacherActivity {
  id: string;
  teacherId: string;
  type: 'content_published' | 'live_session_started' | 'milestone_reached' | 'interaction';
  title: string;
  description: string;
  timestamp: string;
  data: Record<string, any>;
  isRead: boolean;
}

export interface TeacherInteraction {
  id: string;
  userId: string;
  teacherId: string;
  type: 'question' | 'comment' | 'rating' | 'bookmark' | 'share';
  content: string;
  contentId?: string;
  timestamp: string;
  isPublic: boolean;
  likes: number;
  replies: TeacherInteraction[];
}

export interface TeacherLearningPath {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number; // in weeks
  content: {
    id: string;
    type: 'teaching' | 'practice' | 'session';
    order: number;
    isRequired: boolean;
    prerequisites: string[];
  }[];
  progress: {
    userId: string;
    completedContent: string[];
    currentStep: number;
    startedAt: string;
    completedAt?: string;
    lastAccessedAt: string;
  };
  isPublic: boolean;
  isFeatured: boolean;
  enrollmentCount: number;
  averageRating: number;
}
