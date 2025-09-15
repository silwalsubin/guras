import { Achievement } from '@/store/guidedMeditationSlice';
import { MeditationState } from '@/store/meditationSliceNew';
import { GuidedMeditationState } from '@/store/guidedMeditationSlice';

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  isUnlocked: boolean;
  unlockedAt?: string;
}

export interface AchievementCheckResult {
  newlyUnlocked: Achievement[];
  updatedProgress: AchievementProgress[];
}

class AchievementService {
  /**
   * Check all achievements and return newly unlocked ones
   */
  checkAllAchievements(
    meditationState: MeditationState,
    guidedMeditationState: GuidedMeditationState
  ): AchievementCheckResult {
    const newlyUnlocked: Achievement[] = [];
    const updatedProgress: AchievementProgress[] = [];

    guidedMeditationState.achievements.forEach(achievement => {
      if (achievement.isUnlocked) return;

      const progress = this.calculateAchievementProgress(achievement, meditationState, guidedMeditationState);
      const shouldUnlock = progress >= achievement.requirement.target;

      updatedProgress.push({
        achievementId: achievement.id,
        progress,
        isUnlocked: shouldUnlock,
        unlockedAt: shouldUnlock ? new Date().toISOString() : undefined,
      });

      if (shouldUnlock) {
        newlyUnlocked.push({
          ...achievement,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
          progress,
        });
      }
    });

    return { newlyUnlocked, updatedProgress };
  }

  /**
   * Calculate progress for a specific achievement
   */
  private calculateAchievementProgress(
    achievement: Achievement,
    meditationState: MeditationState,
    guidedMeditationState: GuidedMeditationState
  ): number {
    const { requirement, category } = achievement;

    switch (requirement.type) {
      case 'count':
        if (category === 'sessions') {
          return guidedMeditationState.totalGuidedSessions;
        } else if (category === 'programs') {
          return guidedMeditationState.enrolledPrograms.length;
        } else if (category === 'time') {
          return Math.floor(guidedMeditationState.totalGuidedMinutes / 60); // Convert to hours
        }
        break;

      case 'streak':
        if (category === 'streaks') {
          return guidedMeditationState.guidedStreak;
        }
        break;

      case 'program':
        return guidedMeditationState.completedPrograms.length;

      case 'time':
        if (category === 'time') {
          return guidedMeditationState.totalGuidedMinutes;
        }
        break;

      case 'variety':
        if (requirement.condition === 'teachers') {
          const uniqueTeachers = new Set(
            guidedMeditationState.recentSessions.map(s => s.teacherName)
          );
          return uniqueTeachers.size;
        } else if (requirement.condition === 'themes') {
          const uniqueThemes = new Set(
            guidedMeditationState.recentSessions.map(s => s.theme)
          );
          return uniqueThemes.size;
        }
        break;
    }

    return 0;
  }

  /**
   * Get achievement progress percentage
   */
  getProgressPercentage(achievement: Achievement): number {
    if (achievement.isUnlocked) return 100;
    return Math.min((achievement.progress / achievement.requirement.target) * 100, 100);
  }

  /**
   * Get achievement status text
   */
  getStatusText(achievement: Achievement): string {
    if (achievement.isUnlocked) {
      return 'Unlocked!';
    }

    const progress = achievement.progress;
    const target = achievement.requirement.target;

    switch (achievement.requirement.type) {
      case 'count':
        return `${progress}/${target} ${achievement.category}`;
      case 'streak':
        return `${progress}/${target} days`;
      case 'program':
        return `${progress}/${target} programs`;
      case 'time':
        return `${Math.floor(progress / 60)}h/${Math.floor(target / 60)}h`;
      case 'variety':
        return `${progress}/${target} ${achievement.requirement.condition}`;
      default:
        return `${progress}/${target}`;
    }
  }

  /**
   * Get encouraging message for locked achievements
   */
  getEncouragementMessage(achievement: Achievement): string {
    const progress = achievement.progress;
    const target = achievement.requirement.target;
    const remaining = target - progress;

    if (progress === 0) {
      switch (achievement.category) {
        case 'sessions':
          return 'Start your meditation journey!';
        case 'programs':
          return 'Explore guided programs!';
        case 'streaks':
          return 'Build a daily practice!';
        case 'time':
          return 'Begin your mindfulness journey!';
        case 'teachers':
          return 'Try different meditation teachers!';
        case 'themes':
          return 'Explore various meditation themes!';
        default:
          return 'Keep meditating to unlock!';
      }
    }

    if (remaining <= 1) {
      return 'Almost there! You\'re so close!';
    } else if (remaining <= 3) {
      return `Just ${remaining} more to go!`;
    } else {
      return `Keep going! ${remaining} more needed.`;
    }
  }

  /**
   * Get achievement category icon
   */
  getCategoryIcon(category: string): string {
    const iconMap: { [key: string]: string } = {
      sessions: 'play-circle',
      programs: 'calendar-plus-o',
      streaks: 'fire',
      time: 'clock-o',
      teachers: 'users',
      themes: 'palette',
    };
    return iconMap[category] || 'star';
  }

  /**
   * Get achievement rarity based on requirements
   */
  getAchievementRarity(achievement: Achievement): 'common' | 'rare' | 'epic' | 'legendary' {
    const target = achievement.requirement.target;

    switch (achievement.requirement.type) {
      case 'count':
        if (target <= 5) return 'common';
        if (target <= 20) return 'rare';
        if (target <= 50) return 'epic';
        return 'legendary';
      case 'streak':
        if (target <= 7) return 'common';
        if (target <= 30) return 'rare';
        if (target <= 100) return 'epic';
        return 'legendary';
      case 'time':
        if (target <= 60) return 'common'; // 1 hour
        if (target <= 300) return 'rare'; // 5 hours
        if (target <= 1000) return 'epic'; // ~16 hours
        return 'legendary';
      default:
        return 'common';
    }
  }

  /**
   * Get achievement color based on rarity
   */
  getAchievementColor(rarity: 'common' | 'rare' | 'epic' | 'legendary'): string {
    const colorMap = {
      common: '#95A5A6', // Gray
      rare: '#3498DB', // Blue
      epic: '#9B59B6', // Purple
      legendary: '#F39C12', // Gold
    };
    return colorMap[rarity];
  }
}

export default new AchievementService();
