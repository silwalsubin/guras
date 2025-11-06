using Microsoft.Extensions.Logging;
using services.notifications.Domain;
using services.notifications.Repositories;

namespace services.notifications.Services;

public class UserNotificationPreferencesService : IUserNotificationPreferencesService
{
    private readonly IUserNotificationPreferencesRepository _repository;
    private readonly ILogger<UserNotificationPreferencesService> _logger;

    public UserNotificationPreferencesService(IUserNotificationPreferencesRepository repository, ILogger<UserNotificationPreferencesService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<UserNotificationPreferences?> GetUserPreferencesAsync(string userId)
    {
        try
        {
            return await _repository.GetByUserIdAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving preferences for user {UserId}", userId);
            throw;
        }
    }

    public async Task<UserNotificationPreferences> CreateOrUpdateUserPreferencesAsync(UserNotificationPreferences preferences)
    {
        try
        {
            preferences.UpdatedAt = DateTime.UtcNow;
            return await _repository.CreateOrUpdateAsync(preferences);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating or updating preferences for user {UserId}", preferences.UserId);
            throw;
        }
    }

    public async Task<List<UserNotificationPreferences>> GetUsersDueForNotificationAsync()
    {
        try
        {
            return await _repository.GetUsersDueForNotificationAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving users due for notification");
            throw;
        }
    }

    public async Task UpdateLastNotificationSentAsync(string userId)
    {
        try
        {
            await _repository.UpdateLastNotificationSentAsync(userId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating last notification sent for user {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> IsUserInQuietHoursAsync(string userId)
    {
        var preferences = await GetUserPreferencesAsync(userId);
        if (preferences == null) return false;

        return IsUserInQuietHours(preferences, DateTime.UtcNow);
    }

    public async Task<List<UserNotificationPreferences>> GetAllUserPreferencesAsync()
    {
        try
        {
            return await _repository.GetAllAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all user preferences");
            throw;
        }
    }

    public async Task<bool> IsUserDueForNotificationAsync(string userId)
    {
        var preferences = await GetUserPreferencesAsync(userId);
        if (preferences == null) return false;

        return IsUserDueForNotification(preferences, DateTime.UtcNow);
    }

    private static bool IsUserInQuietHours(UserNotificationPreferences preferences, DateTime now)
    {
        var currentTime = now.TimeOfDay;
        var start = preferences.QuietHoursStart;
        var end = preferences.QuietHoursEnd;

        if (start > end)
        {
            return currentTime >= start || currentTime <= end;
        }

        return currentTime >= start && currentTime <= end;
    }

    private static bool IsUserDueForNotification(UserNotificationPreferences preferences, DateTime now)
    {
        if (preferences.LastNotificationSent == DateTime.MinValue)
        {
            return true;
        }

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
