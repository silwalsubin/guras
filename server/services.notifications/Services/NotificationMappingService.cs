using services.notifications.Domain;
using services.notifications.Models;

namespace services.notifications.Services;

public static class NotificationMappingService
{
    public static UserNotificationPreferencesEntity ToEntity(this UserNotificationPreferences preferences)
    {
        return new UserNotificationPreferencesEntity
        {
            UserId = preferences.UserId,
            Enabled = preferences.Enabled,
            Frequency = (int)preferences.Frequency,
            QuietHoursStart = preferences.QuietHoursStart,
            QuietHoursEnd = preferences.QuietHoursEnd,
            LastNotificationSent = preferences.LastNotificationSent,
            CreatedAt = preferences.CreatedAt,
            UpdatedAt = preferences.UpdatedAt
        };
    }

    public static UserNotificationPreferences ToDomain(this UserNotificationPreferencesEntity entity)
    {
        return new UserNotificationPreferences
        {
            UserId = entity.UserId,
            Enabled = entity.Enabled,
            Frequency = (NotificationFrequency)entity.Frequency,
            QuietHoursStart = entity.QuietHoursStart,
            QuietHoursEnd = entity.QuietHoursEnd,
            LastNotificationSent = entity.LastNotificationSent,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }
}

