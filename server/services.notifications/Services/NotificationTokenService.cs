using Microsoft.Extensions.Logging;

namespace services.notifications.Services;

public class NotificationTokenService : INotificationTokenService
{
    private readonly ILogger<NotificationTokenService> _logger;
    
    // In-memory storage for FCM tokens with user associations (for testing - replace with database in production)
    private static readonly Dictionary<string, List<string>> _userTokens = new(); // userId -> List<token>
    private static readonly Dictionary<string, string> _tokenUsers = new(); // token -> userId
    private static readonly object _lock = new();

    public NotificationTokenService(ILogger<NotificationTokenService> logger)
    {
        _logger = logger;
    }

    public List<string> GetStoredTokens()
    {
        lock (_lock)
        {
            var tokens = _tokenUsers.Keys.ToList();
            _logger.LogDebug("Retrieved {Count} stored tokens", tokens.Count);
            return tokens;
        }
    }

    // Static method to get registered tokens (for backward compatibility)
    public static List<string> GetStoredTokensStatic()
    {
        lock (_lock)
        {
            return _tokenUsers.Keys.ToList();
        }
    }

    // Methods to manage tokens (used by NotificationController)
    public void RegisterToken(string token, string platform, string userId)
    {
        lock (_lock)
        {
            // Remove token from previous user if it exists
            if (_tokenUsers.ContainsKey(token))
            {
                var previousUserId = _tokenUsers[token];
                if (_userTokens.ContainsKey(previousUserId))
                {
                    _userTokens[previousUserId].Remove(token);
                    if (_userTokens[previousUserId].Count == 0)
                    {
                        _userTokens.Remove(previousUserId);
                    }
                }
                _logger.LogInformation("Token reassigned from user {PreviousUserId} to user {UserId}", previousUserId, userId);
            }

            // Add token to new user
            if (!_userTokens.ContainsKey(userId))
            {
                _userTokens[userId] = new List<string>();
            }
            _userTokens[userId].Add(token);
            _tokenUsers[token] = userId;
            
            _logger.LogInformation("FCM Token stored for user {UserId}: {TokenPrefix}... (Total users: {TotalUsers}, Total tokens: {TotalTokens})", 
                userId, token[..20], _userTokens.Count, _tokenUsers.Count);
        }
    }

    public Dictionary<string, List<string>> GetUserTokens()
    {
        lock (_lock)
        {
            return new Dictionary<string, List<string>>(_userTokens);
        }
    }

    public Dictionary<string, string> GetTokenUsers()
    {
        lock (_lock)
        {
            return new Dictionary<string, string>(_tokenUsers);
        }
    }

    public (int totalUsers, int totalTokens) GetTokenStatistics()
    {
        lock (_lock)
        {
            return (_userTokens.Count, _tokenUsers.Count);
        }
    }
} 