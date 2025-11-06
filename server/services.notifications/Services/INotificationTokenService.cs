namespace services.notifications.Services;

public interface INotificationTokenService
{
    Task<List<string>> GetStoredTokensAsync();
    List<string> GetStoredTokens(); // Backward compatibility
    Task RegisterTokenAsync(string token, string platform, string userId);
    void RegisterToken(string token, string platform, string userId); // Backward compatibility
    Task<Dictionary<string, List<string>>> GetUserTokensAsync();
    Dictionary<string, List<string>> GetUserTokens(); // Backward compatibility
    Task<Dictionary<string, string>> GetTokenUsersAsync();
    Dictionary<string, string> GetTokenUsers(); // Backward compatibility
    Task<(int totalUsers, int totalTokens)> GetTokenStatisticsAsync();
    (int totalUsers, int totalTokens) GetTokenStatistics(); // Backward compatibility
}
