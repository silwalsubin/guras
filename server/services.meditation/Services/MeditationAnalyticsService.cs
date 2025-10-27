using Dapper;
using services.meditation.Domain;
using System.Data;
using Microsoft.Extensions.Logging;

namespace services.meditation.Services;

/// <summary>
/// Service for managing meditation analytics and session tracking
/// </summary>
public interface IMeditationAnalyticsService
{
    /// <summary>
    /// Log the start of a meditation session
    /// </summary>
    Task<Guid> LogSessionStartAsync(Guid userId, string sessionId, CreateMeditationAnalyticsDto analyticsData);

    /// <summary>
    /// Log the completion of a meditation session
    /// </summary>
    Task<bool> LogSessionCompletionAsync(Guid analyticsId, CreateMeditationAnalyticsDto completionData);

    /// <summary>
    /// Get user's meditation history
    /// </summary>
    Task<List<MeditationAnalyticsDto>> GetUserHistoryAsync(Guid userId, int limit = 50);

    /// <summary>
    /// Get user's meditation patterns for AI analysis
    /// </summary>
    Task<MeditationPatternsDto> GetUserPatternsAsync(Guid userId);

    /// <summary>
    /// Get aggregated meditation statistics for a user
    /// </summary>
    Task<MeditationStatsDto> GetUserStatsAsync(Guid userId);

    /// <summary>
    /// Update emotional state for a session
    /// </summary>
    Task<bool> UpdateEmotionalStateAsync(Guid analyticsId, string emotionalStateBefore, int scoreBefore, string emotionalStateAfter, int scoreAfter);

    /// <summary>
    /// Add user rating and notes to a session
    /// </summary>
    Task<bool> AddUserFeedbackAsync(Guid analyticsId, int rating, string? notes);
}

public class MeditationAnalyticsService : IMeditationAnalyticsService
{
    private readonly IDbConnection _dbConnection;
    private readonly ILogger<MeditationAnalyticsService> _logger;

    public MeditationAnalyticsService(IDbConnection dbConnection, ILogger<MeditationAnalyticsService> logger)
    {
        _dbConnection = dbConnection;
        _logger = logger;
    }

    public async Task<Guid> LogSessionStartAsync(Guid userId, string sessionId, CreateMeditationAnalyticsDto analyticsData)
    {
        try
        {
            var id = Guid.NewGuid();
            var now = DateTime.UtcNow;

            const string sql = @"
                INSERT INTO meditation_analytics (
                    id, user_id, session_id, session_title, teacher_id, teacher_name, 
                    music_id, music_name, session_start_time, planned_duration_seconds,
                    meditation_theme, difficulty_level, is_program_session, program_id, program_day,
                    emotional_state_before, emotional_state_before_score, time_of_day, day_of_week,
                    created_at, updated_at
                ) VALUES (
                    @Id, @UserId, @SessionId, @SessionTitle, @TeacherId, @TeacherName,
                    @MusicId, @MusicName, @SessionStartTime, @PlannedDurationSeconds,
                    @MeditationTheme, @DifficultyLevel, @IsProgramSession, @ProgramId, @ProgramDay,
                    @EmotionalStateBeforeType, @EmotionalStateBeforeScore, @TimeOfDay, @DayOfWeek,
                    @CreatedAt, @UpdatedAt
                )";

            var parameters = new
            {
                Id = id,
                UserId = userId,
                SessionId = sessionId,
                analyticsData.SessionTitle,
                analyticsData.TeacherId,
                analyticsData.TeacherName,
                analyticsData.MusicId,
                analyticsData.MusicName,
                SessionStartTime = analyticsData.SessionStartTime,
                analyticsData.PlannedDurationSeconds,
                analyticsData.MeditationTheme,
                analyticsData.DifficultyLevel,
                analyticsData.IsProgramSession,
                analyticsData.ProgramId,
                analyticsData.ProgramDay,
                analyticsData.EmotionalStateBeforeType,
                analyticsData.EmotionalStateBeforeScore,
                TimeOfDay = GetTimeOfDay(analyticsData.SessionStartTime),
                DayOfWeek = analyticsData.SessionStartTime.DayOfWeek.ToString(),
                CreatedAt = now,
                UpdatedAt = now
            };

            await _dbConnection.ExecuteAsync(sql, parameters);
            _logger.LogInformation("Logged meditation session start for user {UserId}, session {SessionId}", userId, sessionId);
            return id;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging meditation session start for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> LogSessionCompletionAsync(Guid analyticsId, CreateMeditationAnalyticsDto completionData)
    {
        try
        {
            const string sql = @"
                UPDATE meditation_analytics
                SET 
                    session_end_time = @SessionEndTime,
                    duration_seconds = @DurationSeconds,
                    completed = @Completed,
                    completion_percentage = @CompletionPercentage,
                    paused_count = @PausedCount,
                    total_pause_duration_seconds = @TotalPauseDurationSeconds,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

            var parameters = new
            {
                Id = analyticsId,
                completionData.SessionEndTime,
                completionData.DurationSeconds,
                completionData.Completed,
                completionData.CompletionPercentage,
                completionData.PausedCount,
                completionData.TotalPauseDurationSeconds,
                UpdatedAt = DateTime.UtcNow
            };

            var result = await _dbConnection.ExecuteAsync(sql, parameters);
            _logger.LogInformation("Logged meditation session completion for analytics {AnalyticsId}", analyticsId);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging meditation session completion for analytics {AnalyticsId}", analyticsId);
            throw;
        }
    }

    public async Task<List<MeditationAnalyticsDto>> GetUserHistoryAsync(Guid userId, int limit = 50)
    {
        try
        {
            const string sql = @"
                SELECT 
                    id, user_id, session_id, session_title, teacher_name, music_name,
                    session_start_time, duration_seconds, meditation_theme, difficulty_level,
                    completed, completion_percentage, emotional_state_before_score,
                    emotional_state_after_score, user_rating, created_at
                FROM meditation_analytics
                WHERE user_id = @UserId
                ORDER BY session_start_time DESC
                LIMIT @Limit";

            var result = await _dbConnection.QueryAsync<MeditationAnalyticsDto>(sql, new { UserId = userId, Limit = limit });
            return result.ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation history for user {UserId}", userId);
            throw;
        }
    }

    public async Task<MeditationPatternsDto> GetUserPatternsAsync(Guid userId)
    {
        try
        {
            // Get preferred teachers
            const string teachersSql = @"
                SELECT teacher_name, COUNT(*) as count
                FROM meditation_analytics
                WHERE user_id = @UserId AND completed = true
                GROUP BY teacher_name
                ORDER BY count DESC
                LIMIT 5";

            var teachers = await _dbConnection.QueryAsync<(string name, int count)>(teachersSql, new { UserId = userId });

            // Get preferred themes
            const string themesSql = @"
                SELECT meditation_theme, COUNT(*) as count
                FROM meditation_analytics
                WHERE user_id = @UserId AND completed = true
                GROUP BY meditation_theme
                ORDER BY count DESC
                LIMIT 5";

            var themes = await _dbConnection.QueryAsync<(string name, int count)>(themesSql, new { UserId = userId });

            // Get best times of day
            const string timesSql = @"
                SELECT time_of_day, COUNT(*) as count, AVG(completion_percentage) as avg_completion
                FROM meditation_analytics
                WHERE user_id = @UserId
                GROUP BY time_of_day
                ORDER BY avg_completion DESC";

            var times = await _dbConnection.QueryAsync<(string timeOfDay, int count, double avgCompletion)>(timesSql, new { UserId = userId });

            return new MeditationPatternsDto
            {
                PreferredTeachers = teachers.Select(t => new PatternItem { Name = t.name, Count = t.count }).ToList(),
                PreferredThemes = themes.Select(t => new PatternItem { Name = t.name, Count = t.count }).ToList(),
                BestTimesOfDay = times.Select(t => new TimePatternItem { TimeOfDay = t.timeOfDay, Count = t.count, AverageCompletion = t.avgCompletion }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation patterns for user {UserId}", userId);
            throw;
        }
    }

    public async Task<MeditationStatsDto> GetUserStatsAsync(Guid userId)
    {
        try
        {
            const string sql = @"
                SELECT 
                    COUNT(*) as total_sessions,
                    SUM(CASE WHEN completed = true THEN 1 ELSE 0 END) as completed_sessions,
                    SUM(duration_seconds) as total_minutes_seconds,
                    AVG(completion_percentage) as avg_completion_percentage,
                    AVG(user_rating) as avg_rating,
                    AVG(emotional_state_after_score - emotional_state_before_score) as avg_mood_improvement
                FROM meditation_analytics
                WHERE user_id = @UserId";

            var result = await _dbConnection.QuerySingleAsync<dynamic>(sql, new { UserId = userId });

            return new MeditationStatsDto
            {
                TotalSessions = result.total_sessions ?? 0,
                CompletedSessions = result.completed_sessions ?? 0,
                TotalMinutes = (result.total_minutes_seconds ?? 0) / 60,
                AverageCompletionPercentage = result.avg_completion_percentage ?? 0,
                AverageRating = result.avg_rating ?? 0,
                AverageMoodImprovement = result.avg_mood_improvement ?? 0
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation stats for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> UpdateEmotionalStateAsync(Guid analyticsId, string emotionalStateBefore, int scoreBefore, string emotionalStateAfter, int scoreAfter)
    {
        try
        {
            const string sql = @"
                UPDATE meditation_analytics
                SET 
                    emotional_state_before = @EmotionalStateBefore,
                    emotional_state_before_score = @ScoreBefore,
                    emotional_state_after = @EmotionalStateAfter,
                    emotional_state_after_score = @ScoreAfter,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

            var result = await _dbConnection.ExecuteAsync(sql, new
            {
                Id = analyticsId,
                EmotionalStateBefore = emotionalStateBefore,
                ScoreBefore = scoreBefore,
                EmotionalStateAfter = emotionalStateAfter,
                ScoreAfter = scoreAfter,
                UpdatedAt = DateTime.UtcNow
            });

            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating emotional state for analytics {AnalyticsId}", analyticsId);
            throw;
        }
    }

    public async Task<bool> AddUserFeedbackAsync(Guid analyticsId, int rating, string? notes)
    {
        try
        {
            const string sql = @"
                UPDATE meditation_analytics
                SET 
                    user_rating = @Rating,
                    user_notes = @Notes,
                    updated_at = @UpdatedAt
                WHERE id = @Id";

            var result = await _dbConnection.ExecuteAsync(sql, new
            {
                Id = analyticsId,
                Rating = rating,
                Notes = notes,
                UpdatedAt = DateTime.UtcNow
            });

            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user feedback for analytics {AnalyticsId}", analyticsId);
            throw;
        }
    }

    private static string GetTimeOfDay(DateTime dateTime)
    {
        var hour = dateTime.Hour;
        return hour switch
        {
            >= 5 and < 12 => "morning",
            >= 12 and < 17 => "afternoon",
            >= 17 and < 21 => "evening",
            _ => "night"
        };
    }
}

/// <summary>
/// DTO for user meditation patterns
/// </summary>
public class MeditationPatternsDto
{
    public List<PatternItem> PreferredTeachers { get; set; } = new();
    public List<PatternItem> PreferredThemes { get; set; } = new();
    public List<TimePatternItem> BestTimesOfDay { get; set; } = new();
}

public class PatternItem
{
    public string Name { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class TimePatternItem
{
    public string TimeOfDay { get; set; } = string.Empty;
    public int Count { get; set; }
    public double AverageCompletion { get; set; }
}

/// <summary>
/// DTO for user meditation statistics
/// </summary>
public class MeditationStatsDto
{
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public int TotalMinutes { get; set; }
    public double AverageCompletionPercentage { get; set; }
    public double AverageRating { get; set; }
    public double AverageMoodImprovement { get; set; }
}

