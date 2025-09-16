import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  TeacherFollow, 
  TeacherContent, 
  TeacherFeed, 
  TeacherRecommendation,
  TeacherInsight,
  TeacherSearchFilters,
  TeacherSearchResult,
  TeacherActivity,
  TeacherLearningPath
} from '../types/teacher';

// Teacher Following State
export interface TeacherState {
  // Following
  followedTeachers: TeacherFollow[];
  teacherFeeds: TeacherFeed[];
  teacherActivities: TeacherActivity[];
  
  // Content
  teacherContent: TeacherContent[];
  bookmarkedContent: string[];
  recentContent: string[];
  
  // Recommendations
  recommendations: TeacherRecommendation[];
  insights: TeacherInsight[];
  
  // Search
  searchResults: TeacherSearchResult[];
  searchFilters: TeacherSearchFilters;
  searchQuery: string;
  
  // Learning
  learningPaths: TeacherLearningPath[];
  currentLearningPath: TeacherLearningPath | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  selectedTeacher: string | null;
  showFollowingOnly: boolean;
  
  // Offline
  isOfflineMode: boolean;
  lastSyncTime: number;
  pendingActions: string[];
}

const initialState: TeacherState = {
  followedTeachers: [],
  teacherFeeds: [],
  teacherActivities: [],
  teacherContent: [],
  bookmarkedContent: [],
  recentContent: [],
  recommendations: [],
  insights: [],
  searchResults: [],
  searchFilters: {},
  searchQuery: '',
  learningPaths: [],
  currentLearningPath: null,
  isLoading: false,
  error: null,
  selectedTeacher: null,
  showFollowingOnly: false,
  isOfflineMode: false,
  lastSyncTime: 0,
  pendingActions: []
};

// Async thunks
export const followTeacher = createAsyncThunk(
  'teacher/followTeacher',
  async (teacherData: { teacherId: string; teacherType: 'spiritual' | 'meditation' }) => {
    // TODO: Implement API call
    const follow: TeacherFollow = {
      id: `follow_${Date.now()}`,
      userId: 'user123', // TODO: Get from auth
      teacherId: teacherData.teacherId,
      teacherType: teacherData.teacherType,
      followedAt: new Date().toISOString(),
      isActive: true,
      notificationSettings: {
        newContent: true,
        dailyGuidance: true,
        liveSessions: true,
        weeklyDigest: true,
        frequency: 'daily',
        quietHours: {
          enabled: true,
          start: '22:00',
          end: '08:00'
        }
      },
      personalization: {
        interests: [],
        difficulty: 'beginner',
        preferredContentTypes: ['teachings', 'practices'],
        learningGoals: [],
        timePreferences: {
          morning: true,
          afternoon: false,
          evening: true
        },
        sessionLength: 'medium'
      }
    };
    
    return follow;
  }
);

export const unfollowTeacher = createAsyncThunk(
  'teacher/unfollowTeacher',
  async (teacherId: string) => {
    // TODO: Implement API call
    return teacherId;
  }
);

export const searchTeachers = createAsyncThunk(
  'teacher/searchTeachers',
  async (filters: TeacherSearchFilters & { query?: string }) => {
    // TODO: Implement API call
    return {
      results: [] as TeacherSearchResult[],
      totalCount: 0
    };
  }
);

export const getTeacherFeed = createAsyncThunk(
  'teacher/getTeacherFeed',
  async (teacherId: string) => {
    // TODO: Implement API call
    const feed: TeacherFeed = {
      id: `feed_${teacherId}`,
      userId: 'user123',
      teacherId,
      content: [],
      lastUpdated: new Date().toISOString(),
      hasNewContent: false,
      unreadCount: 0
    };
    
    return feed;
  }
);

export const getTeacherRecommendations = createAsyncThunk(
  'teacher/getRecommendations',
  async (userId: string) => {
    // TODO: Implement API call
    return [] as TeacherRecommendation[];
  }
);

export const bookmarkContent = createAsyncThunk(
  'teacher/bookmarkContent',
  async (contentId: string) => {
    // TODO: Implement API call
    return contentId;
  }
);

export const unbookmarkContent = createAsyncThunk(
  'teacher/unbookmarkContent',
  async (contentId: string) => {
    // TODO: Implement API call
    return contentId;
  }
);

export const getLearningPaths = createAsyncThunk(
  'teacher/getLearningPaths',
  async (teacherId?: string) => {
    // TODO: Implement API call
    return [] as TeacherLearningPath[];
  }
);

// Slice
const teacherSlice = createSlice({
  name: 'teacher',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    
    setSearchFilters: (state, action: PayloadAction<TeacherSearchFilters>) => {
      state.searchFilters = { ...state.searchFilters, ...action.payload };
    },
    
    setSelectedTeacher: (state, action: PayloadAction<string | null>) => {
      state.selectedTeacher = action.payload;
    },
    
    setShowFollowingOnly: (state, action: PayloadAction<boolean>) => {
      state.showFollowingOnly = action.payload;
    },
    
    addTeacherActivity: (state, action: PayloadAction<TeacherActivity>) => {
      state.teacherActivities.unshift(action.payload);
    },
    
    markActivityAsRead: (state, action: PayloadAction<string>) => {
      const activity = state.teacherActivities.find(a => a.id === action.payload);
      if (activity) {
        activity.isRead = true;
      }
    },
    
    addInsight: (state, action: PayloadAction<TeacherInsight>) => {
      state.insights.unshift(action.payload);
    },
    
    markInsightAsRead: (state, action: PayloadAction<string>) => {
      const insight = state.insights.find(i => i.id === action.payload);
      if (insight) {
        insight.isRead = true;
      }
    },
    
    updateNotificationSettings: (state, action: PayloadAction<{ teacherId: string; settings: Partial<TeacherFollow['notificationSettings']> }>) => {
      const follow = state.followedTeachers.find(f => f.teacherId === action.payload.teacherId);
      if (follow) {
        follow.notificationSettings = { ...follow.notificationSettings, ...action.payload.settings };
      }
    },
    
    updatePersonalization: (state, action: PayloadAction<{ teacherId: string; personalization: Partial<TeacherFollow['personalization']> }>) => {
      const follow = state.followedTeachers.find(f => f.teacherId === action.payload.teacherId);
      if (follow) {
        follow.personalization = { ...follow.personalization, ...action.payload.personalization };
      }
    },
    
    setOfflineMode: (state, action: PayloadAction<boolean>) => {
      state.isOfflineMode = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    }
  },
  
  extraReducers: (builder) => {
    builder
      // Follow Teacher
      .addCase(followTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(followTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followedTeachers.push(action.payload);
      })
      .addCase(followTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to follow teacher';
      })
      
      // Unfollow Teacher
      .addCase(unfollowTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unfollowTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.followedTeachers = state.followedTeachers.filter(f => f.teacherId !== action.payload);
      })
      .addCase(unfollowTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to unfollow teacher';
      })
      
      // Search Teachers
      .addCase(searchTeachers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchTeachers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload.results;
      })
      .addCase(searchTeachers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to search teachers';
      })
      
      // Get Teacher Feed
      .addCase(getTeacherFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeacherFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        const existingFeed = state.teacherFeeds.find(f => f.teacherId === action.payload.teacherId);
        if (existingFeed) {
          existingFeed.content = action.payload.content;
          existingFeed.lastUpdated = action.payload.lastUpdated;
          existingFeed.hasNewContent = action.payload.hasNewContent;
          existingFeed.unreadCount = action.payload.unreadCount;
        } else {
          state.teacherFeeds.push(action.payload);
        }
      })
      .addCase(getTeacherFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get teacher feed';
      })
      
      // Get Recommendations
      .addCase(getTeacherRecommendations.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getTeacherRecommendations.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recommendations = action.payload;
      })
      .addCase(getTeacherRecommendations.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get recommendations';
      })
      
      // Bookmark Content
      .addCase(bookmarkContent.fulfilled, (state, action) => {
        if (!state.bookmarkedContent.includes(action.payload)) {
          state.bookmarkedContent.push(action.payload);
        }
      })
      
      // Unbookmark Content
      .addCase(unbookmarkContent.fulfilled, (state, action) => {
        state.bookmarkedContent = state.bookmarkedContent.filter(id => id !== action.payload);
      })
      
      // Get Learning Paths
      .addCase(getLearningPaths.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getLearningPaths.fulfilled, (state, action) => {
        state.isLoading = false;
        state.learningPaths = action.payload;
      })
      .addCase(getLearningPaths.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to get learning paths';
      });
  }
});

export const {
  setSearchQuery,
  setSearchFilters,
  setSelectedTeacher,
  setShowFollowingOnly,
  addTeacherActivity,
  markActivityAsRead,
  addInsight,
  markInsightAsRead,
  updateNotificationSettings,
  updatePersonalization,
  setOfflineMode,
  clearError
} = teacherSlice.actions;

export default teacherSlice.reducer;
