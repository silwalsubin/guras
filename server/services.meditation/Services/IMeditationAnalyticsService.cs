using services.meditation.Domain;

namespace services.meditation.Services;

/// <summary>
/// Service interface for managing meditation analytics and session tracking
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

