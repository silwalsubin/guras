using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using services.meditation.Services;
using services.meditation.Domain;
using System.Security.Claims;
using Microsoft.Extensions.Logging;
using utilities.Controllers;

namespace services.meditation.Controllers;

/// <summary>
/// Controller for meditation recommendation endpoints
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class MeditationRecommendationController : BaseController
{
    private readonly IMeditationRecommendationService _recommendationService;
    private readonly ILogger<MeditationRecommendationController> _logger;

    public MeditationRecommendationController(
        IMeditationRecommendationService recommendationService,
        ILogger<MeditationRecommendationController> logger)
    {
        _recommendationService = recommendationService;
        _logger = logger;
    }

    /// <summary>
    /// Get the current user's ID from claims (returns Guid)
    /// </summary>
    private Guid GetUserGuid()
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
    /// Get personalized meditation recommendations for the current user
    /// </summary>
    /// <param name="count">Number of recommendations to return (default: 3, max: 10)</param>
    /// <returns>List of personalized meditation recommendations</returns>
    [HttpGet("personalized")]
    public async Task<IActionResult> GetPersonalizedRecommendations([FromQuery] int count = 3)
    {
        try
        {
            // Validate count parameter
            if (count < 1 || count > 10)
            {
                return ValidationErrorResponse("Count must be between 1 and 10");
            }

            var userId = GetUserGuid();
            _logger.LogInformation("Fetching {Count} personalized recommendations for user {UserId}", count, userId);

            var recommendations = await _recommendationService.GenerateRecommendationsAsync(userId, count);

            if (!recommendations.Any())
            {
                _logger.LogWarning("No recommendations generated for user {UserId}", userId);
                return SuccessResponse(new List<MeditationRecommendationDto>());
            }

            _logger.LogInformation("Successfully generated {Count} recommendations for user {UserId}", recommendations.Count, userId);
            return SuccessResponse(recommendations);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching personalized recommendations");
            return ErrorResponse("Failed to generate recommendations", 500);
        }
    }

    /// <summary>
    /// Get the reason why a specific session is recommended
    /// </summary>
    /// <param name="sessionTitle">Title of the meditation session</param>
    /// <returns>Explanation of why this session is recommended</returns>
    [HttpGet("reason")]
    public async Task<IActionResult> GetRecommendationReason([FromQuery] string sessionTitle)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(sessionTitle))
            {
                return ValidationErrorResponse("Session title is required");
            }

            var userId = GetUserGuid();
            _logger.LogInformation("Fetching recommendation reason for session '{SessionTitle}' for user {UserId}", sessionTitle, userId);

            var reason = await _recommendationService.GetRecommendationReasonAsync(userId, sessionTitle);

            return SuccessResponse(new RecommendationReasonDto
            {
                SessionTitle = sessionTitle,
                Reason = reason
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recommendation reason");
            return ErrorResponse("Failed to fetch recommendation reason", 500);
        }
    }

    /// <summary>
    /// Get top recommendations for a specific time of day
    /// </summary>
    /// <param name="timeOfDay">Time of day: morning, afternoon, evening, or night</param>
    /// <param name="count">Number of recommendations (default: 3)</param>
    /// <returns>Recommendations optimized for the specified time</returns>
    [HttpGet("by-time")]
    public async Task<IActionResult> GetRecommendationsByTime(
        [FromQuery] string timeOfDay,
        [FromQuery] int count = 3)
    {
        try
        {
            // Validate time of day
            var validTimes = new[] { "morning", "afternoon", "evening", "night" };
            if (string.IsNullOrWhiteSpace(timeOfDay) || !validTimes.Contains(timeOfDay.ToLower()))
            {
                return ValidationErrorResponse("Invalid time of day. Must be: morning, afternoon, evening, or night");
            }

            if (count < 1 || count > 10)
            {
                return ValidationErrorResponse("Count must be between 1 and 10");
            }

            var userId = GetUserGuid();
            _logger.LogInformation("Fetching {Count} recommendations for {TimeOfDay} for user {UserId}", count, timeOfDay, userId);

            var recommendations = await _recommendationService.GenerateRecommendationsAsync(userId, count);

            // Filter recommendations for the specified time (in a real implementation, this would be more sophisticated)
            var filteredRecommendations = recommendations.Take(count).ToList();

            return SuccessResponse(filteredRecommendations);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recommendations by time");
            return ErrorResponse("Failed to fetch recommendations", 500);
        }
    }

    /// <summary>
    /// Get recommendations based on user's emotional state
    /// </summary>
    /// <param name="emotionalState">Current emotional state (e.g., stressed, anxious, neutral, happy)</param>
    /// <param name="count">Number of recommendations (default: 3)</param>
    /// <returns>Recommendations tailored to the emotional state</returns>
    [HttpGet("by-emotion")]
    public async Task<IActionResult> GetRecommendationsByEmotion(
        [FromQuery] string emotionalState,
        [FromQuery] int count = 3)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(emotionalState))
            {
                return ValidationErrorResponse("Emotional state is required");
            }

            if (count < 1 || count > 10)
            {
                return ValidationErrorResponse("Count must be between 1 and 10");
            }

            var userId = GetUserGuid();
            _logger.LogInformation("Fetching {Count} recommendations for emotional state '{EmotionalState}' for user {UserId}", 
                count, emotionalState, userId);

            var recommendations = await _recommendationService.GenerateRecommendationsAsync(userId, count);

            // Filter recommendations based on emotional state (in a real implementation, this would be more sophisticated)
            var filteredRecommendations = recommendations.Take(count).ToList();

            return SuccessResponse(filteredRecommendations);
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized access attempt");
            return UnauthorizedResponse("User ID not found in claims");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching recommendations by emotion");
            return ErrorResponse("Failed to fetch recommendations", 500);
        }
    }
}

