using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.notifications.Data;
using services.notifications.Domain;
using services.notifications.Models;
using services.notifications.Services;

namespace services.notifications.Repositories;

public class UserNotificationPreferencesRepository : IUserNotificationPreferencesRepository
{
    private readonly NotificationsDbContext _context;
    private readonly ILogger<UserNotificationPreferencesRepository> _logger;

    public UserNotificationPreferencesRepository(NotificationsDbContext context, ILogger<UserNotificationPreferencesRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<UserNotificationPreferences?> GetByUserIdAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Retrieving notification preferences for user: {UserId} using Entity Framework", userId);
            var entity = await _context.UserNotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving notification preferences for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<UserNotificationPreferences> CreateOrUpdateAsync(UserNotificationPreferences preferences)
    {
        try
        {
            _logger.LogInformation("Creating or updating notification preferences for user: {UserId} using Entity Framework", preferences.UserId);

            var entity = await _context.UserNotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == preferences.UserId);

            if (entity == null)
            {
                entity = preferences.ToEntity();
                entity.CreatedAt = DateTime.UtcNow;
                _context.UserNotificationPreferences.Add(entity);
                _logger.LogInformation("Created notification preferences for user {UserId}", preferences.UserId);
            }
            else
            {
                entity.Enabled = preferences.Enabled;
                entity.Frequency = (int)preferences.Frequency;
                entity.QuietHoursStart = preferences.QuietHoursStart;
                entity.QuietHoursEnd = preferences.QuietHoursEnd;
                entity.LastNotificationSent = preferences.LastNotificationSent;
                entity.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Updated notification preferences for user {UserId}", preferences.UserId);
            }

            await _context.SaveChangesAsync();
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating or updating notification preferences for user: {UserId}", preferences.UserId);
            throw;
        }
    }

    public async Task<List<UserNotificationPreferences>> GetUsersDueForNotificationAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving users due for notification using Entity Framework");
            var now = DateTime.UtcNow;
            var currentTime = now.TimeOfDay;

            var entities = await _context.UserNotificationPreferences
                .Where(p => p.Enabled)
                .ToListAsync();

            var dueUsers = new List<UserNotificationPreferences>();

            foreach (var entity in entities)
            {
                var preferences = entity.ToDomain();

                // Check quiet hours
                if (IsUserInQuietHours(preferences, now))
                    continue;

                // Check if due for notification
                if (IsUserDueForNotification(preferences, now))
                {
                    dueUsers.Add(preferences);
                }
            }

            _logger.LogInformation("Found {Count} users due for notification", dueUsers.Count);
            return dueUsers;
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
            _logger.LogInformation("Updating last notification sent for user: {UserId} using Entity Framework", userId);
            var entity = await _context.UserNotificationPreferences
                .FirstOrDefaultAsync(p => p.UserId == userId);

            if (entity != null)
            {
                entity.LastNotificationSent = DateTime.UtcNow;
                entity.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                _logger.LogDebug("Updated last notification time for user {UserId}", userId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating last notification sent for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<List<UserNotificationPreferences>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all notification preferences using Entity Framework");
            var entities = await _context.UserNotificationPreferences
                .ToListAsync();

            return entities.Select(e => e.ToDomain()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all notification preferences");
            throw;
        }
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

