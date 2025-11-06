using Microsoft.Extensions.Logging;
using services.meditation.Domain;
using services.meditation.Repositories;
using services.meditation.Services;

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
    private readonly IMeditationAnalyticsRepository _repository;
    private readonly ILogger<MeditationAnalyticsService> _logger;

    public MeditationAnalyticsService(IMeditationAnalyticsRepository repository, ILogger<MeditationAnalyticsService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Guid> LogSessionStartAsync(Guid userId, string sessionId, CreateMeditationAnalyticsDto analyticsData)
    {
        try
        {
            analyticsData.TimeOfDay = GetTimeOfDay(analyticsData.SessionStartTime);
            analyticsData.DayOfWeek = analyticsData.SessionStartTime.DayOfWeek.ToString();

            var analytics = analyticsData.ToDomain(userId);
            var created = await _repository.CreateAsync(analytics);
            _logger.LogInformation("Logged meditation session start for user {UserId}, session {SessionId}", userId, sessionId);
            return created.Id;
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
            var existing = await _repository.GetByIdAsync(analyticsId);
            if (existing == null)
            {
                _logger.LogWarning("Meditation analytics not found for completion: {AnalyticsId}", analyticsId);
                return false;
            }

            existing.SessionEndTime = completionData.SessionEndTime;
            existing.DurationSeconds = completionData.DurationSeconds;
            existing.Completed = completionData.Completed;
            existing.CompletionPercentage = completionData.CompletionPercentage;
            existing.PausedCount = completionData.PausedCount;
            existing.TotalPauseDurationSeconds = completionData.TotalPauseDurationSeconds;
            existing.UpdatedAt = DateTime.UtcNow;

            var result = await _repository.UpdateAsync(existing);
            _logger.LogInformation("Logged meditation session completion for analytics {AnalyticsId}", analyticsId);
            return result;
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
            var analytics = await _repository.GetByUserIdAsync(userId, limit);
            return analytics.Select(a => new MeditationAnalyticsDto
            {
                Id = a.Id,
                UserId = a.UserId,
                SessionId = a.SessionId,
                SessionTitle = a.SessionTitle,
                TeacherName = a.TeacherName,
                MusicName = a.MusicName,
                SessionStartTime = a.SessionStartTime,
                DurationSeconds = a.DurationSeconds,
                MeditationTheme = a.MeditationTheme,
                DifficultyLevel = a.DifficultyLevel,
                Completed = a.Completed,
                CompletionPercentage = a.CompletionPercentage,
                EmotionalStateBeforeScore = a.EmotionalStateBeforeScore,
                EmotionalStateAfterScore = a.EmotionalStateAfterScore,
                UserRating = a.UserRating,
                TimeOfDay = a.TimeOfDay,
                CreatedAt = a.CreatedAt
            }).ToList();
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
            return await _repository.GetUserPatternsAsync(userId);
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
            return await _repository.GetUserStatsAsync(userId);
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
            var existing = await _repository.GetByIdAsync(analyticsId);
            if (existing == null)
            {
                _logger.LogWarning("Meditation analytics not found for emotional state update: {AnalyticsId}", analyticsId);
                return false;
            }

            existing.EmotionalStateBeforeType = emotionalStateBefore;
            existing.EmotionalStateBeforeScore = scoreBefore;
            existing.EmotionalStateAfterType = emotionalStateAfter;
            existing.EmotionalStateAfterScore = scoreAfter;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _repository.UpdateAsync(existing);
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
            var existing = await _repository.GetByIdAsync(analyticsId);
            if (existing == null)
            {
                _logger.LogWarning("Meditation analytics not found for feedback: {AnalyticsId}", analyticsId);
                return false;
            }

            existing.UserRating = rating;
            existing.UserNotes = notes;
            existing.UpdatedAt = DateTime.UtcNow;

            return await _repository.UpdateAsync(existing);
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

