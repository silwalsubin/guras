import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { getThemeColors, getBrandColors } from '@/config/colors';
import Icon from 'react-native-vector-icons/FontAwesome';
import { HorizontalSeparator, SemiTransparentCard } from '@/components/shared';

const { width } = Dimensions.get('window');

interface GuidedProgressDashboardProps {
  onAchievementPress?: (achievementId: string) => void;
  onMilestonePress?: (milestoneId: string) => void;
}

const GuidedProgressDashboard: React.FC<GuidedProgressDashboardProps> = ({
  onAchievementPress,
  onMilestonePress,
}) => {
  const isDarkMode = useSelector((state: RootState) => state.theme.isDarkMode);
  const guidedMeditation = useSelector((state: RootState) => state.guidedMeditation);
  const themeColors = getThemeColors(isDarkMode);
  const brandColors = getBrandColors();

  const renderStatsCard = () => (
    <SemiTransparentCard>
      <View style={styles.cardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
          <Icon name="bar-chart" size={16} color={brandColors.primary} />
        </View>
        <View style={styles.headerTextContainer}>
          <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
            Guided Meditation Stats
          </Text>
          <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
            Your guided meditation journey
          </Text>
        </View>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: brandColors.primary }]}>
            {guidedMeditation.totalGuidedSessions}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Sessions
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: brandColors.primary }]}>
            {guidedMeditation.totalGuidedMinutes}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Minutes
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: brandColors.primary }]}>
            {guidedMeditation.guidedStreak}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Day Streak
          </Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: brandColors.primary }]}>
            {guidedMeditation.completedPrograms.length}
          </Text>
          <Text style={[styles.statLabel, { color: themeColors.textSecondary }]}>
            Programs
          </Text>
        </View>
      </View>

      {guidedMeditation.averageSessionRating > 0 && (
        <View style={styles.ratingContainer}>
          <Text style={[styles.ratingLabel, { color: themeColors.textSecondary }]}>
            Average Rating:
          </Text>
          <View style={styles.ratingStars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Icon
                key={star}
                name={star <= guidedMeditation.averageSessionRating ? 'star' : 'star-o'}
                size={14}
                color="#FFD700"
                style={styles.star}
              />
            ))}
            <Text style={[styles.ratingValue, { color: themeColors.textPrimary }]}>
              {guidedMeditation.averageSessionRating.toFixed(1)}
            </Text>
          </View>
        </View>
      )}
    </SemiTransparentCard>
  );

  const renderAchievements = () => {
    const unlockedAchievements = guidedMeditation.achievements.filter(a => a.isUnlocked);
    const inProgressAchievements = guidedMeditation.achievements.filter(a => !a.isUnlocked && a.progress > 0);
    const lockedAchievements = guidedMeditation.achievements.filter(a => !a.isUnlocked && a.progress === 0);

    return (
      <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#FFD700' + '20' }]}>
            <Icon name="trophy" size={16} color="#FFD700" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Achievements
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              {unlockedAchievements.length} of {guidedMeditation.achievements.length} unlocked
            </Text>
          </View>
        </View>

        <View style={styles.achievementsGrid}>
          {/* Unlocked Achievements */}
          {unlockedAchievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[styles.achievementGridCard, { backgroundColor: '#FFD700' + '20', borderColor: '#FFD700' }]}
              onPress={() => onAchievementPress && onAchievementPress(achievement.id)}
            >
              <Icon name={achievement.icon} size={24} color="#FFD700" />
              <Text style={[styles.achievementGridName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                {achievement.name}
              </Text>
              <Text style={[styles.achievementGridDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
                {achievement.description}
              </Text>
              <View style={[styles.unlockedBadge, { backgroundColor: '#FFD700' }]}>
                <Icon name="check" size={10} color="white" />
              </View>
            </TouchableOpacity>
          ))}

          {/* In Progress Achievements */}
          {inProgressAchievements.map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[styles.achievementGridCard, { backgroundColor: themeColors.background, borderColor: brandColors.primary }]}
              onPress={() => onAchievementPress && onAchievementPress(achievement.id)}
            >
              <Icon name={achievement.icon} size={24} color={brandColors.primary} />
              <Text style={[styles.achievementGridName, { color: themeColors.textPrimary }]} numberOfLines={2}>
                {achievement.name}
              </Text>
              <Text style={[styles.achievementGridDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
                {achievement.description}
              </Text>
              <View style={styles.progressContainer}>
                <View style={[styles.progressBar, { backgroundColor: themeColors.border }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        backgroundColor: brandColors.primary,
                        width: `${(achievement.progress / achievement.requirement.target) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.progressText, { color: themeColors.textSecondary }]}>
                  {achievement.progress}/{achievement.requirement.target}
                </Text>
              </View>
            </TouchableOpacity>
          ))}

          {/* Locked Achievements */}
          {lockedAchievements.slice(0, 4).map((achievement) => (
            <TouchableOpacity
              key={achievement.id}
              style={[styles.achievementGridCard, { backgroundColor: themeColors.background, borderColor: themeColors.border, opacity: 0.6 }]}
              onPress={() => onAchievementPress && onAchievementPress(achievement.id)}
            >
              <Icon name="lock" size={24} color={themeColors.textSecondary} />
              <Text style={[styles.achievementGridName, { color: themeColors.textSecondary }]} numberOfLines={2}>
                ???
              </Text>
              <Text style={[styles.achievementGridDescription, { color: themeColors.textSecondary }]} numberOfLines={2}>
                Complete more sessions to unlock
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </SemiTransparentCard>
    );
  };

  const renderRecentActivity = () => {
    const recentSessions = guidedMeditation.recentSessions.slice(0, 5);

    if (recentSessions.length === 0) {
      return null;
    }

    return (
      <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: brandColors.primary + '20' }]}>
            <Icon name="clock-o" size={16} color={brandColors.primary} />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Recent Sessions
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Your latest guided meditations
            </Text>
          </View>
        </View>

        {recentSessions.map((session, index) => (
          <View key={`${session.sessionId}-${index}`} style={[styles.activityItem, { borderBottomColor: themeColors.border }]}>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: themeColors.textPrimary }]} numberOfLines={1}>
                {session.sessionTitle}
              </Text>
              <Text style={[styles.activityMeta, { color: themeColors.textSecondary }]}>
                {session.teacherName} • {session.duration} min • {session.theme.replace('-', ' ')}
              </Text>
              <Text style={[styles.activityDate, { color: themeColors.textSecondary }]}>
                {new Date(session.completedAt).toLocaleDateString()}
              </Text>
            </View>
            
            <View style={styles.activityBadges}>
              {session.isProgram && (
                <View style={[styles.programBadge, { backgroundColor: brandColors.primary + '20' }]}>
                  <Text style={[styles.programBadgeText, { color: brandColors.primary }]}>
                    Program
                  </Text>
                </View>
              )}
              {session.rating && (
                <View style={styles.ratingBadge}>
                  <Icon name="star" size={10} color="#FFD700" />
                  <Text style={[styles.ratingBadgeText, { color: themeColors.textSecondary }]}>
                    {session.rating}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}
      </SemiTransparentCard>
    );
  };

  const renderMilestones = () => {
    const recentMilestones = guidedMeditation.milestones.slice(0, 3);

    if (recentMilestones.length === 0) {
      return null;
    }

    return (
      <SemiTransparentCard>
        <View style={styles.cardHeader}>
          <View style={[styles.iconContainer, { backgroundColor: '#FF6B6B' + '20' }]}>
            <Icon name="flag" size={16} color="#FF6B6B" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={[styles.cardTitle, { color: themeColors.textPrimary }]}>
              Recent Milestones
            </Text>
            <Text style={[styles.cardSubtitle, { color: themeColors.textSecondary }]}>
              Your latest achievements
            </Text>
          </View>
        </View>

        {recentMilestones.map((milestone) => (
          <TouchableOpacity
            key={milestone.id}
            style={[styles.milestoneItem, { borderBottomColor: themeColors.border }]}
            onPress={() => onMilestonePress && onMilestonePress(milestone.id)}
          >
            <View style={[styles.milestoneIcon, { backgroundColor: '#FF6B6B' + '20' }]}>
              <Icon name={milestone.icon} size={16} color="#FF6B6B" />
            </View>
            <View style={styles.milestoneInfo}>
              <Text style={[styles.milestoneTitle, { color: themeColors.textPrimary }]}>
                {milestone.title}
              </Text>
              <Text style={[styles.milestoneDescription, { color: themeColors.textSecondary }]}>
                {milestone.description}
              </Text>
              <Text style={[styles.milestoneDate, { color: themeColors.textSecondary }]}>
                {new Date(milestone.achievedAt).toLocaleDateString()}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </SemiTransparentCard>
    );
  };

  return (
    <>
      <View style={styles.pastCardWrapper}>
        {renderAchievements()}
      </View>
      {renderRecentActivity() && (
        <View style={styles.pastCardWrapper}>
          {renderRecentActivity()}
        </View>
      )}
      {renderMilestones() && (
        <View style={styles.pastCardWrapper}>
          {renderMilestones()}
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 16,
  },
  card: {
    borderRadius: 0,
    padding: 20,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  ratingLabel: {
    fontSize: 14,
    marginRight: 8,
  },
  ratingStars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 2,
  },
  ratingValue: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  achievementGridCard: {
    width: '48%',
    padding: 8,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
    alignItems: 'flex-start',
    position: 'relative',
    minHeight: 100,
  },
  achievementGridName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'left',
    marginTop: 6,
    marginBottom: 2,
    lineHeight: 14,
  },
  achievementGridDescription: {
    fontSize: 10,
    textAlign: 'left',
    marginBottom: 4,
    flex: 1,
    lineHeight: 12,
  },
  // Legacy styles for backward compatibility
  achievementsScroll: {
    marginTop: 8,
  },
  achievementCard: {
    width: 140,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    position: 'relative',
  },
  achievementName: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
  },
  unlockedBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'flex-start',
    marginTop: 4,
  },
  progressBar: {
    width: '100%',
    height: 3,
    borderRadius: 2,
    marginBottom: 3,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 9,
    alignSelf: 'flex-start',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  activityInfo: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  activityMeta: {
    fontSize: 12,
    marginBottom: 2,
    textTransform: 'capitalize',
  },
  activityDate: {
    fontSize: 11,
  },
  activityBadges: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  programBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  programBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingBadgeText: {
    fontSize: 10,
    marginLeft: 2,
  },
  milestoneItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  milestoneIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  milestoneDescription: {
    fontSize: 12,
    marginBottom: 2,
  },
  milestoneDate: {
    fontSize: 11,
  },
  // Past Card Wrapper for margins
  pastCardWrapper: {
    marginHorizontal: 16,
    marginBottom: 8,
  },
});

export default GuidedProgressDashboard;
