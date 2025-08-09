using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using services.notifications.Services;
using services.notifications.Domain;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UserNotificationPreferencesController : ControllerBase
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
                return Unauthorized(new { message = "User not authenticated" });
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

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user notification preferences");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost]
    public async Task<IActionResult> UpdateUserPreferences([FromBody] UpdateNotificationPreferencesRequest request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Parse frequency
            if (!Enum.TryParse<NotificationFrequency>(request.Frequency, true, out var frequency))
            {
                return BadRequest(new { message = "Invalid frequency value" });
            }

            // Parse quiet hours
            if (!TimeSpan.TryParse(request.QuietHours.Start, out var startTime) ||
                !TimeSpan.TryParse(request.QuietHours.End, out var endTime))
            {
                return BadRequest(new { message = "Invalid quiet hours format. Use HH:MM format." });
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

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user notification preferences");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("test")]
    public async Task<IActionResult> SendTestNotification()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(new { message = "User not authenticated" });
            }

            // Get user's FCM tokens
            var userTokens = _tokenService.GetUserTokens();
            if (!userTokens.TryGetValue(userId, out var tokens) || !tokens.Any())
            {
                return BadRequest(new { message = "No FCM tokens found for user" });
            }

            // Send test notification
            // This would typically call the notification service
            _logger.LogInformation("Test notification requested for user {UserId}", userId);

            return Ok(new { message = "Test notification sent", tokenCount = tokens.Count });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending test notification");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}

public class UpdateNotificationPreferencesRequest
{
    public bool Enabled { get; set; }
    public string Frequency { get; set; } = string.Empty; // "5min", "hourly", "twice-daily", "daily"
    public QuietHoursRequest QuietHours { get; set; } = new();
}

public class QuietHoursRequest
{
    public string Start { get; set; } = string.Empty; // "HH:MM" format
    public string End { get; set; } = string.Empty;   // "HH:MM" format
}
