using services.notifications.Domain;

namespace services.notifications.Repositories;

public interface IUserNotificationPreferencesRepository
{
    Task<UserNotificationPreferences?> GetByUserIdAsync(string userId);
    Task<UserNotificationPreferences> CreateOrUpdateAsync(UserNotificationPreferences preferences);
    Task<List<UserNotificationPreferences>> GetUsersDueForNotificationAsync();
    Task UpdateLastNotificationSentAsync(string userId);
    Task<List<UserNotificationPreferences>> GetAllAsync();
}

