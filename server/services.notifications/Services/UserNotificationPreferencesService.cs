using Microsoft.Extensions.Logging;
using services.notifications.Domain;

namespace services.notifications.Services;

public class UserNotificationPreferencesService : IUserNotificationPreferencesService
{
    private readonly ILogger<UserNotificationPreferencesService> _logger;
    
    // In-memory storage for user preferences (replace with database in production)
    private static readonly Dictionary<string, UserNotificationPreferences> _userPreferences = new();
    private static readonly object _lock = new();

    public UserNotificationPreferencesService(ILogger<UserNotificationPreferencesService> logger)
    {
        _logger = logger;
    }

    public async Task<UserNotificationPreferences?> GetUserPreferencesAsync(string userId)
    {
        await Task.CompletedTask; // Simulate async operation
        
        lock (_lock)
        {
            if (_userPreferences.TryGetValue(userId, out var preferences))
            {
                _logger.LogDebug("Retrieved preferences for user {UserId}", userId);
                return preferences;
            }
            
            _logger.LogDebug("No preferences found for user {UserId}, returning null", userId);
            return null;
        }
    }

    public async Task<UserNotificationPreferences> CreateOrUpdateUserPreferencesAsync(UserNotificationPreferences preferences)
    {
        await Task.CompletedTask; // Simulate async operation
        
        lock (_lock)
        {
            preferences.UpdatedAt = DateTime.UtcNow;
            
            if (_userPreferences.ContainsKey(preferences.UserId))
            {
                _userPreferences[preferences.UserId] = preferences;
                _logger.LogInformation("Updated notification preferences for user {UserId}", preferences.UserId);
            }
            else
            {
                preferences.CreatedAt = DateTime.UtcNow;
                _userPreferences[preferences.UserId] = preferences;
                _logger.LogInformation("Created notification preferences for user {UserId}", preferences.UserId);
            }
            
            return preferences;
        }
    }

    public async Task<List<UserNotificationPreferences>> GetUsersDueForNotificationAsync()
    {
        await Task.CompletedTask; // Simulate async operation
        
        var now = DateTime.UtcNow;
        var dueUsers = new List<UserNotificationPreferences>();
        
        lock (_lock)
        {
            foreach (var preferences in _userPreferences.Values)
            {
                if (!preferences.Enabled)
                    continue;

                if (IsUserInQuietHours(preferences, now))
                    continue;

                if (IsUserDueForNotification(preferences, now))
                {
                    dueUsers.Add(preferences);
                }
            }
        }
        
        _logger.LogDebug("Found {Count} users due for notification", dueUsers.Count);
        return dueUsers;
    }

    public async Task UpdateLastNotificationSentAsync(string userId)
    {
        await Task.CompletedTask; // Simulate async operation
        
        lock (_lock)
        {
            if (_userPreferences.TryGetValue(userId, out var preferences))
            {
                preferences.LastNotificationSent = DateTime.UtcNow;
                preferences.UpdatedAt = DateTime.UtcNow;
                _logger.LogDebug("Updated last notification time for user {UserId}", userId);
            }
        }
    }

    public async Task<bool> IsUserInQuietHoursAsync(string userId)
    {
        var preferences = await GetUserPreferencesAsync(userId);
        if (preferences == null) return false;
        
        return IsUserInQuietHours(preferences, DateTime.UtcNow);
    }

    private bool IsUserInQuietHours(UserNotificationPreferences preferences, DateTime now)
    {
        var currentTime = now.TimeOfDay;
        var start = preferences.QuietHoursStart;
        var end = preferences.QuietHoursEnd;
        
        // Handle quiet hours that span midnight
        if (start > end)
        {
            return currentTime >= start || currentTime <= end;
        }
        
        return currentTime >= start && currentTime <= end;
    }

    private bool IsUserDueForNotification(UserNotificationPreferences preferences, DateTime now)
    {
        var timeSinceLastNotification = now - preferences.LastNotificationSent;
        
        return preferences.Frequency switch
        {
            NotificationFrequency.FiveMinutes => timeSinceLastNotification >= TimeSpan.FromMinutes(5),
            NotificationFrequency.Hourly => timeSinceLastNotification >= TimeSpan.FromHours(1),
            NotificationFrequency.TwiceDaily => timeSinceLastNotification >= TimeSpan.FromHours(12),
            NotificationFrequency.Daily => timeSinceLastNotification >= TimeSpan.FromDays(1),
            _ => false
        };
    }
}
