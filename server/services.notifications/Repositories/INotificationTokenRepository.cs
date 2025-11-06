namespace services.notifications.Repositories;

public interface INotificationTokenRepository
{
    Task<List<string>> GetTokensByUserIdAsync(string userId);
    Task<List<string>> GetAllTokensAsync();
    Task RegisterTokenAsync(string token, string platform, string userId);
    Task<Dictionary<string, List<string>>> GetUserTokensAsync();
    Task<Dictionary<string, string>> GetTokenUsersAsync();
    Task<(int totalUsers, int totalTokens)> GetTokenStatisticsAsync();
}

