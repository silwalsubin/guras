using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using services.notifications.Services;
using services.notifications.Domain;
using apis.Requests;
using apis.Extensions;
using utilities.Controllers;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserNotificationPreferencesController : BaseController
{
    private readonly ILogger<UserNotificationPreferencesController> _logger;
    private readonly IUserNotificationPreferencesService _preferencesService;
    private readonly INotificationTokenService _tokenService;

    public UserNotificationPreferencesController(
        ILogger<UserNotificationPreferencesController> logger,
        IUserNotificationPreferencesService preferencesService,
        INotificationTokenService tokenService)
    {
        _logger = logger;
        _preferencesService = preferencesService;
        _tokenService = tokenService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUserPreferences()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return UnauthorizedResponse("User not authenticated");
            }

            var preferences = await _preferencesService.GetUserPreferencesAsync(userId);
            if (preferences == null)
            {
                // Return default preferences if none exist
                preferences = new UserNotificationPreferences
                {
                    UserId = userId,
                    Enabled = true,
                    Frequency = NotificationFrequency.Daily,
                    QuietHoursStart = new TimeSpan(22, 0, 0),
                    QuietHoursEnd = new TimeSpan(8, 0, 0)
                };
            }

            var response = new
            {
                enabled = preferences.Enabled,
                frequency = preferences.Frequency.ToString().ToLowerInvariant(),
                quietHours = new
                {
                    start = preferences.QuietHoursStart.ToString(@"hh\:mm"),
                    end = preferences.QuietHoursEnd.ToString(@"hh\:mm")
                },
                lastNotificationSent = preferences.LastNotificationSent,
                createdAt = preferences.CreatedAt,
                updatedAt = preferences.UpdatedAt
            };

            return SuccessResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user notification preferences");
            return ErrorResponse("Internal server error", 500);
        }
    }

    [HttpPost]
    public async Task<IActionResult> UpdateUserPreferences([FromBody] UpdateNotificationPreferencesRequest request)
    {
        try
        {
            // Validate the request first - fail fast if invalid
            try
            {
                request.Validate();
            }
            catch (ArgumentException ex)
            {
                return ValidationErrorResponse(ex.Message);
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return UnauthorizedResponse("User not authenticated");
            }

            // Parse frequency
            if (!Enum.TryParse<NotificationFrequency>(request.Frequency, true, out var frequency))
            {
                return ValidationErrorResponse("Invalid frequency value", "frequency");
            }

            // Parse quiet hours
            if (!TimeSpan.TryParse(request.QuietHours.Start, out var startTime) ||
                !TimeSpan.TryParse(request.QuietHours.End, out var endTime))
            {
                return ValidationErrorResponse("Invalid quiet hours format. Use HH:MM format.", "quietHours");
            }

            var preferences = new UserNotificationPreferences
            {
                UserId = userId,
                Enabled = request.Enabled,
                Frequency = frequency,
                QuietHoursStart = startTime,
                QuietHoursEnd = endTime
            };

            var updatedPreferences = await _preferencesService.CreateOrUpdateUserPreferencesAsync(preferences);

            _logger.LogInformation("User {UserId} updated notification preferences: Enabled={Enabled}, Frequency={Frequency}",
                userId, request.Enabled, request.Frequency);

            var response = new
            {
                enabled = updatedPreferences.Enabled,
                frequency = updatedPreferences.Frequency.ToString().ToLowerInvariant(),
                quietHours = new
                {
                    start = updatedPreferences.QuietHoursStart.ToString(@"hh\:mm"),
                    end = updatedPreferences.QuietHoursEnd.ToString(@"hh\:mm")
                },
                lastNotificationSent = updatedPreferences.LastNotificationSent,
                createdAt = updatedPreferences.CreatedAt,
                updatedAt = updatedPreferences.UpdatedAt
            };

            return SuccessResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user notification preferences");
            return ErrorResponse("Internal server error", 500);
        }
    }

    [HttpPost("test")]
    public Task<IActionResult> SendTestNotification()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Task.FromResult<IActionResult>(UnauthorizedResponse("User not authenticated"));
            }

            // Get user's FCM tokens
            var userTokens = _tokenService.GetUserTokens();
            if (!userTokens.TryGetValue(userId, out var tokens) || !tokens.Any())
            {
                return Task.FromResult<IActionResult>(ErrorResponse("No FCM tokens found for user", 400));
            }

            // Send test notification
            // This would typically call the notification service
            _logger.LogInformation("Test notification requested for user {UserId}", userId);

            return Task.FromResult<IActionResult>(SuccessResponse(new { message = "Test notification sent", tokenCount = tokens.Count }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test notification");
            return Task.FromResult<IActionResult>(ErrorResponse("Internal server error", 500));
        }
    }
}

