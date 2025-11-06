using Microsoft.Extensions.Logging;
using services.notifications.Repositories;

namespace services.notifications.Services;

public class NotificationTokenService : INotificationTokenService
{
    private readonly INotificationTokenRepository _repository;
    private readonly ILogger<NotificationTokenService> _logger;

    public NotificationTokenService(INotificationTokenRepository repository, ILogger<NotificationTokenService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<string>> GetStoredTokensAsync()
    {
        try
        {
            var tokens = await _repository.GetAllTokensAsync();
            _logger.LogDebug("Retrieved {Count} stored tokens", tokens.Count);
            return tokens;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving stored tokens");
            throw;
        }
    }

    public List<string> GetStoredTokens()
    {
        // Synchronous wrapper for backward compatibility
        return GetStoredTokensAsync().GetAwaiter().GetResult();
    }

    public static List<string> GetStoredTokensStatic()
    {
        // This method is kept for backward compatibility but should be avoided
        // In a real implementation, this would need access to the service
        return new List<string>();
    }

    public async Task RegisterTokenAsync(string token, string platform, string userId)
    {
        try
        {
            await _repository.RegisterTokenAsync(token, platform, userId);
            var stats = await _repository.GetTokenStatisticsAsync();
            _logger.LogInformation("FCM Token stored for user {UserId}: {TokenPrefix}... (Total users: {TotalUsers}, Total tokens: {TotalTokens})",
                userId, token.Length > 20 ? token[..20] : token, stats.totalUsers, stats.totalTokens);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering token for user {UserId}", userId);
            throw;
        }
    }

    public void RegisterToken(string token, string platform, string userId)
    {
        // Synchronous wrapper for backward compatibility
        RegisterTokenAsync(token, platform, userId).GetAwaiter().GetResult();
    }

    public async Task<Dictionary<string, List<string>>> GetUserTokensAsync()
    {
        try
        {
            return await _repository.GetUserTokensAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user tokens");
            throw;
        }
    }

    public Dictionary<string, List<string>> GetUserTokens()
    {
        // Synchronous wrapper for backward compatibility
        return GetUserTokensAsync().GetAwaiter().GetResult();
    }

    public async Task<Dictionary<string, string>> GetTokenUsersAsync()
    {
        try
        {
            return await _repository.GetTokenUsersAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving token users");
            throw;
        }
    }

    public Dictionary<string, string> GetTokenUsers()
    {
        // Synchronous wrapper for backward compatibility
        return GetTokenUsersAsync().GetAwaiter().GetResult();
    }

    public async Task<(int totalUsers, int totalTokens)> GetTokenStatisticsAsync()
    {
        try
        {
            return await _repository.GetTokenStatisticsAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving token statistics");
            throw;
        }
    }

    public (int totalUsers, int totalTokens) GetTokenStatistics()
    {
        // Synchronous wrapper for backward compatibility
        return GetTokenStatisticsAsync().GetAwaiter().GetResult();
    }
}
