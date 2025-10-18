namespace services.notifications.Services;

public interface INotificationTokenService
{
    List<string> GetStoredTokens();
    void RegisterToken(string token, string platform, string userId);
    Dictionary<string, List<string>> GetUserTokens();
    Dictionary<string, string> GetTokenUsers();
    (int totalUsers, int totalTokens) GetTokenStatistics();
}
