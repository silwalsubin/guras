import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { GuidedMeditationSession, MeditationProgram, UserMeditationProgress } from '@/types/meditation';

export interface GuidedMeditationState {
  // Session Progress
  completedSessions: UserMeditationProgress[];
  totalGuidedSessions: number;
  totalGuidedMinutes: number;
  
  // Program Progress
  enrolledPrograms: string[]; // Program IDs
  programProgress: { [programId: string]: ProgramProgress };
  completedPrograms: string[];
  
  // Achievements
  achievements: Achievement[];
  unlockedAchievements: string[];
  
  // Streaks and Stats
  guidedStreak: number;
  longestGuidedStreak: number;
  favoriteTeacherId?: string;
  favoriteTheme?: string;
  averageSessionRating: number;
  
  // Recent Activity
  recentSessions: SessionActivity[];
  
  // Milestones
  milestones: Milestone[];
}

export interface ProgramProgress {
  programId: string;
  currentDay: number;
  completedDays: number[];
  enrolledAt: string;
  lastActivityAt: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'sessions' | 'programs' | 'streaks' | 'time' | 'teachers' | 'themes';
  requirement: {
    type: 'count' | 'streak' | 'program' | 'time' | 'variety';
    target: number;
    condition?: string;
  };
  isUnlocked: boolean;
  unlockedAt?: string;
  progress: number;
}

export interface SessionActivity {
  sessionId: string;
  sessionTitle: string;
  teacherName: string;
  duration: number;
  theme: string;
  completedAt: string;
  rating?: number;
  mood?: {
    before: number;
    after: number;
  };
  isProgram: boolean;
  programId?: string;
  programDay?: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  icon: string;
  achievedAt: string;
  type: 'session' | 'program' | 'streak' | 'time';
}

const initialState: GuidedMeditationState = {
  completedSessions: [],
  totalGuidedSessions: 0,
  totalGuidedMinutes: 0,
  enrolledPrograms: [],
  programProgress: {},
  completedPrograms: [],
  achievements: [
    {
      id: 'first-guided',
      name: 'First Guided Session',
      description: 'Complete your first guided meditation',
      icon: 'star',
      category: 'sessions',
      requirement: { type: 'count', target: 1 },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'guided-explorer',
      name: 'Guided Explorer',
      description: 'Complete 10 guided meditation sessions',
      icon: 'compass',
      category: 'sessions',
      requirement: { type: 'count', target: 10 },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'program-starter',
      name: 'Program Starter',
      description: 'Enroll in your first meditation program',
      icon: 'calendar-plus-o',
      category: 'programs',
      requirement: { type: 'count', target: 1 },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'program-finisher',
      name: 'Program Finisher',
      description: 'Complete a full meditation program',
      icon: 'trophy',
      category: 'programs',
      requirement: { type: 'program', target: 1 },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'guided-streak-7',
      name: 'Guided Week',
      description: '7-day guided meditation streak',
      icon: 'fire',
      category: 'streaks',
      requirement: { type: 'streak', target: 7 },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'teacher-variety',
      name: 'Teacher Explorer',
      description: 'Complete sessions with 3 different teachers',
      icon: 'users',
      category: 'teachers',
      requirement: { type: 'variety', target: 3, condition: 'teachers' },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'theme-variety',
      name: 'Theme Explorer',
      description: 'Try 5 different meditation themes',
      icon: 'tags',
      category: 'themes',
      requirement: { type: 'variety', target: 5, condition: 'themes' },
      isUnlocked: false,
      progress: 0,
    },
    {
      id: 'guided-hour',
      name: 'Guided Hour',
      description: 'Complete 60 minutes of guided meditation',
      icon: 'clock-o',
      category: 'time',
      requirement: { type: 'time', target: 60 },
      isUnlocked: false,
      progress: 0,
    },
  ],
  unlockedAchievements: [],
  guidedStreak: 0,
  longestGuidedStreak: 0,
  averageSessionRating: 0,
  recentSessions: [],
  milestones: [],
};

const guidedMeditationSlice = createSlice({
  name: 'guidedMeditation',
  initialState,
  reducers: {
    completeGuidedSession: (state, action: PayloadAction<{
      session: GuidedMeditationSession;
      rating?: number;
      mood?: { before: number; after: number };
      programId?: string;
      programDay?: number;
    }>) => {
      const { session, rating, mood, programId, programDay } = action.payload;
      const now = new Date().toISOString();
      
      // Add to completed sessions
      const progress: UserMeditationProgress = {
        sessionId: session.id,
        completed: true,
        completedAt: now,
        rating,
        mood,
      };
      state.completedSessions.push(progress);
      
      // Update stats
      state.totalGuidedSessions += 1;
      state.totalGuidedMinutes += session.duration;
      
      // Update average rating
      if (rating) {
        const totalRated = state.completedSessions.filter(s => s.rating).length;
        const sumRatings = state.completedSessions.reduce((sum, s) => sum + (s.rating || 0), 0);
        state.averageSessionRating = sumRatings / totalRated;
      }
      
      // Add to recent activity
      const activity: SessionActivity = {
        sessionId: session.id,
        sessionTitle: session.title,
        teacherName: session.teacher.name,
        duration: session.duration,
        theme: session.theme,
        completedAt: now,
        rating,
        mood,
        isProgram: !!programId,
        programId,
        programDay,
      };
      state.recentSessions.unshift(activity);
      
      // Keep only last 50 activities
      if (state.recentSessions.length > 50) {
        state.recentSessions = state.recentSessions.slice(0, 50);
      }
      
      // Update streak
      guidedMeditationSlice.caseReducers.updateGuidedStreak(state);
      
      // Check achievements
      guidedMeditationSlice.caseReducers.checkAchievements(state);
    },
    
    enrollInProgram: (state, action: PayloadAction<string>) => {
      const programId = action.payload;
      if (!state.enrolledPrograms.includes(programId)) {
        state.enrolledPrograms.push(programId);
        state.programProgress[programId] = {
          programId,
          currentDay: 1,
          completedDays: [],
          enrolledAt: new Date().toISOString(),
          lastActivityAt: new Date().toISOString(),
          isCompleted: false,
        };
        
        // Check achievements
        guidedMeditationSlice.caseReducers.checkAchievements(state);
      }
    },
    
    updateProgramProgress: (state, action: PayloadAction<{
      programId: string;
      completedDay: number;
      totalDays: number;
    }>) => {
      const { programId, completedDay, totalDays } = action.payload;
      const progress = state.programProgress[programId];
      
      if (progress && !progress.completedDays.includes(completedDay)) {
        progress.completedDays.push(completedDay);
        progress.currentDay = Math.min(completedDay + 1, totalDays);
        progress.lastActivityAt = new Date().toISOString();
        
        // Check if program is completed
        if (progress.completedDays.length >= totalDays) {
          progress.isCompleted = true;
          progress.completedAt = new Date().toISOString();
          
          if (!state.completedPrograms.includes(programId)) {
            state.completedPrograms.push(programId);
            
            // Add milestone
            const milestone: Milestone = {
              id: `program-${programId}-completed`,
              title: 'Program Completed!',
              description: `Finished a ${totalDays}-day meditation program`,
              icon: 'trophy',
              achievedAt: new Date().toISOString(),
              type: 'program',
            };
            state.milestones.unshift(milestone);
          }
        }
        
        // Check achievements
        guidedMeditationSlice.caseReducers.checkAchievements(state);
      }
    },
    
    updateGuidedStreak: (state) => {
      // Calculate current streak based on recent sessions
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let streak = 0;
      let currentDate = new Date(today);
      
      while (true) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const hasSessionOnDate = state.recentSessions.some(session => 
          session.completedAt.split('T')[0] === dateStr
        );
        
        if (hasSessionOnDate) {
          streak++;
          currentDate.setDate(currentDate.getDate() - 1);
        } else {
          break;
        }
      }
      
      state.guidedStreak = streak;
      if (streak > state.longestGuidedStreak) {
        state.longestGuidedStreak = streak;
      }
    },
    
    checkAchievements: (state) => {
      state.achievements.forEach(achievement => {
        if (achievement.isUnlocked) return;
        
        let progress = 0;
        let shouldUnlock = false;
        
        switch (achievement.requirement.type) {
          case 'count':
            if (achievement.category === 'sessions') {
              progress = state.totalGuidedSessions;
            } else if (achievement.category === 'programs') {
              progress = state.enrolledPrograms.length;
            }
            shouldUnlock = progress >= achievement.requirement.target;
            break;
            
          case 'streak':
            progress = state.guidedStreak;
            shouldUnlock = progress >= achievement.requirement.target;
            break;
            
          case 'program':
            progress = state.completedPrograms.length;
            shouldUnlock = progress >= achievement.requirement.target;
            break;
            
          case 'time':
            progress = state.totalGuidedMinutes;
            shouldUnlock = progress >= achievement.requirement.target;
            break;
            
          case 'variety':
            if (achievement.requirement.condition === 'teachers') {
              const uniqueTeachers = new Set(state.recentSessions.map(s => s.teacherName));
              progress = uniqueTeachers.size;
            } else if (achievement.requirement.condition === 'themes') {
              const uniqueThemes = new Set(state.recentSessions.map(s => s.theme));
              progress = uniqueThemes.size;
            }
            shouldUnlock = progress >= achievement.requirement.target;
            break;
        }
        
        achievement.progress = progress;
        
        if (shouldUnlock) {
          achievement.isUnlocked = true;
          achievement.unlockedAt = new Date().toISOString();
          
          if (!state.unlockedAchievements.includes(achievement.id)) {
            state.unlockedAchievements.push(achievement.id);
            
            // Add milestone
            const milestone: Milestone = {
              id: `achievement-${achievement.id}`,
              title: 'Achievement Unlocked!',
              description: achievement.name,
              icon: achievement.icon,
              achievedAt: new Date().toISOString(),
              type: 'session',
            };
            state.milestones.unshift(milestone);
          }
        }
      });
    },
    
    addMilestone: (state, action: PayloadAction<Milestone>) => {
      state.milestones.unshift(action.payload);
      // Keep only last 100 milestones
      if (state.milestones.length > 100) {
        state.milestones = state.milestones.slice(0, 100);
      }
    },
    
    resetProgress: (state) => {
      return initialState;
    },
  },
});

export const {
  completeGuidedSession,
  enrollInProgram,
  updateProgramProgress,
  updateGuidedStreak,
  checkAchievements,
  addMilestone,
  resetProgress,
} = guidedMeditationSlice.actions;

export default guidedMeditationSlice.reducer;
