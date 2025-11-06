using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using services.meditation.Domain;
using services.meditation.Services;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using utilities.Controllers;

namespace services.meditation.Controllers;

/// <summary>
/// Controller for meditation analytics endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeditationAnalyticsController : BaseController
{
    private readonly IMeditationAnalyticsService _analyticsService;
    private readonly ILogger<MeditationAnalyticsController> _logger;

    public MeditationAnalyticsController(
        IMeditationAnalyticsService analyticsService,
        ILogger<MeditationAnalyticsController> logger)
    {
        _analyticsService = analyticsService;
        _logger = logger;
    }

    /// <summary>
    /// Get the current user's ID from claims as a Guid
    /// </summary>
    private Guid GetUserIdGuid()
    {
        // Try to get application user ID first (database user ID)
        var applicationUserIdClaim = User.FindFirst("application_user_id")?.Value;
        if (!string.IsNullOrWhiteSpace(applicationUserIdClaim) && Guid.TryParse(applicationUserIdClaim, out var applicationUserId))
        {
            return applicationUserId;
        }

        // Fallback to NameIdentifier (Firebase UID) - but this won't be a GUID
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !Guid.TryParse(userIdClaim.Value, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in claims");
        }
        return userId;
    }

    /// <summary>
    /// Log the start of a meditation session
    /// </summary>
    [HttpPost("session-start")]
    public async Task<IActionResult> LogSessionStart([FromBody] CreateMeditationAnalyticsDto request)
    {
        try
        {
            var userId = GetUserIdGuid();
            var sessionId = Guid.NewGuid().ToString();

            _logger.LogInformation("Logging meditation session start for user {UserId}", userId);

            var analyticsId = await _analyticsService.LogSessionStartAsync(userId, sessionId, request);
            return SuccessResponse(new { analyticsId, sessionId });
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging meditation session start");
            return ErrorResponse("Failed to log session start", 500);
        }
    }

    /// <summary>
    /// Log the completion of a meditation session
    /// </summary>
    [HttpPost("session-completion/{analyticsId}")]
    public async Task<IActionResult> LogSessionCompletion(Guid analyticsId, [FromBody] CreateMeditationAnalyticsDto request)
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation("Logging meditation session completion for user {UserId}, analytics {AnalyticsId}", userId, analyticsId);

            var result = await _analyticsService.LogSessionCompletionAsync(analyticsId, request);
            if (!result)
            {
                return NotFoundResponse("Analytics record not found");
            }

            return SuccessResponse(new { message = "Session completion logged successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging meditation session completion");
            return ErrorResponse("Failed to log session completion", 500);
        }
    }

    /// <summary>
    /// Get user's meditation history
    /// </summary>
    [HttpGet("history")]
    public async Task<IActionResult> GetUserHistory([FromQuery] int limit = 50)
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation("Retrieving meditation history for user {UserId}", userId);

            var history = await _analyticsService.GetUserHistoryAsync(userId, limit);
            return SuccessResponse(history);
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation history");
            return ErrorResponse("Failed to retrieve history", 500);
        }
    }

    /// <summary>
    /// Get user's meditation patterns for AI analysis
    /// </summary>
    [HttpGet("patterns")]
    public async Task<IActionResult> GetUserPatterns()
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation("Retrieving meditation patterns for user {UserId}", userId);

            var patterns = await _analyticsService.GetUserPatternsAsync(userId);
            return SuccessResponse(patterns);
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation patterns");
            return ErrorResponse("Failed to retrieve patterns", 500);
        }
    }

    /// <summary>
    /// Get user's meditation statistics
    /// </summary>
    [HttpGet("stats")]
    public async Task<IActionResult> GetUserStats()
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation("Retrieving meditation stats for user {UserId}", userId);

            var stats = await _analyticsService.GetUserStatsAsync(userId);
            return SuccessResponse(stats);
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation stats");
            return ErrorResponse("Failed to retrieve stats", 500);
        }
    }

    /// <summary>
    /// Update emotional state for a meditation session
    /// </summary>
    [HttpPut("emotional-state/{analyticsId}")]
    public async Task<IActionResult> UpdateEmotionalState(
        Guid analyticsId,
        [FromBody] UpdateEmotionalStateRequest request)
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation("Updating emotional state for user {UserId}, analytics {AnalyticsId}", userId, analyticsId);

            var result = await _analyticsService.UpdateEmotionalStateAsync(
                analyticsId,
                request.EmotionalStateBefore,
                request.ScoreBefore,
                request.EmotionalStateAfter,
                request.ScoreAfter);

            if (!result)
            {
                return NotFoundResponse("Analytics record not found");
            }

            return SuccessResponse(new { message = "Emotional state updated successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating emotional state");
            return ErrorResponse("Failed to update emotional state", 500);
        }
    }

    /// <summary>
    /// Add user feedback (rating and notes) to a meditation session
    /// </summary>
    [HttpPut("feedback/{analyticsId}")]
    public async Task<IActionResult> AddUserFeedback(
        Guid analyticsId,
        [FromBody] AddUserFeedbackRequest request)
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation("Adding user feedback for user {UserId}, analytics {AnalyticsId}", userId, analyticsId);

            var result = await _analyticsService.AddUserFeedbackAsync(analyticsId, request.Rating, request.Notes);

            if (!result)
            {
                return NotFoundResponse("Analytics record not found");
            }

            return SuccessResponse(new { message = "Feedback added successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error adding user feedback");
            return ErrorResponse("Failed to add feedback", 500);
        }
    }

    /// <summary>
    /// Log recommendation interaction event (view, click, session start, etc.)
    /// </summary>
    [HttpPost("recommendation-event")]
    public IActionResult LogRecommendationEvent(
        [FromBody] RecommendationEventRequest request)
    {
        try
        {
            var userId = GetUserIdGuid();
            _logger.LogInformation(
                "Logging recommendation event for user {UserId}: {EventType} - {RecommendationTitle}",
                userId, request.EventType, request.RecommendationTitle);

            // Log the event (can be extended to store in database)
            _logger.LogInformation(
                "Recommendation Event Details: Theme={Theme}, Difficulty={Difficulty}, Duration={Duration}s, Timestamp={Timestamp}",
                request.RecommendationTheme, request.RecommendationDifficulty, request.RecommendationDuration, request.Timestamp);

            return SuccessResponse(new { message = "Recommendation event logged successfully" });
        }
        catch (UnauthorizedAccessException)
        {
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error logging recommendation event");
            return ErrorResponse("Failed to log recommendation event", 500);
        }
    }
}

/// <summary>
/// Request model for updating emotional state
/// </summary>
public class UpdateEmotionalStateRequest
{
    public string EmotionalStateBefore { get; set; } = string.Empty;
    public int ScoreBefore { get; set; }
    public string EmotionalStateAfter { get; set; } = string.Empty;
    public int ScoreAfter { get; set; }
}

/// <summary>
/// Request model for adding user feedback
/// </summary>
public class AddUserFeedbackRequest
{
    public int Rating { get; set; }
    public string? Notes { get; set; }
}

/// <summary>
/// Request model for logging recommendation events
/// </summary>
public class RecommendationEventRequest
{
    public string EventType { get; set; } = string.Empty;
    public string RecommendationTitle { get; set; } = string.Empty;
    public string RecommendationTheme { get; set; } = string.Empty;
    public string RecommendationDifficulty { get; set; } = string.Empty;
    public int RecommendationDuration { get; set; }
    public string Timestamp { get; set; } = string.Empty;
    public Dictionary<string, object>? Metadata { get; set; }
}

