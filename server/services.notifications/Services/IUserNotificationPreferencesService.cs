using services.notifications.Domain;

namespace services.notifications.Services;

public interface IUserNotificationPreferencesService
{
    Task<UserNotificationPreferences?> GetUserPreferencesAsync(string userId);
    Task<UserNotificationPreferences> CreateOrUpdateUserPreferencesAsync(UserNotificationPreferences preferences);
    Task<List<UserNotificationPreferences>> GetUsersDueForNotificationAsync();
    Task UpdateLastNotificationSentAsync(string userId);
    Task<bool> IsUserInQuietHoursAsync(string userId);
}
