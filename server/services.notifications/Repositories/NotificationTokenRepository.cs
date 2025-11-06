using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.notifications.Data;
using services.notifications.Models;

namespace services.notifications.Repositories;

public class NotificationTokenRepository : INotificationTokenRepository
{
    private readonly NotificationsDbContext _context;
    private readonly ILogger<NotificationTokenRepository> _logger;

    public NotificationTokenRepository(NotificationsDbContext context, ILogger<NotificationTokenRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<string>> GetTokensByUserIdAsync(string userId)
    {
        try
        {
            _logger.LogInformation("Retrieving tokens for user: {UserId} using Entity Framework", userId);
            var tokens = await _context.NotificationTokens
                .Where(t => t.UserId == userId)
                .Select(t => t.Token)
                .ToListAsync();

            return tokens;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving tokens for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<List<string>> GetAllTokensAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all tokens using Entity Framework");
            var tokens = await _context.NotificationTokens
                .Select(t => t.Token)
                .ToListAsync();

            return tokens;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all tokens");
            throw;
        }
    }

    public async Task RegisterTokenAsync(string token, string platform, string userId)
    {
        try
        {
            _logger.LogInformation("Registering token for user: {UserId} using Entity Framework", userId);

            // Check if token already exists
            var existingToken = await _context.NotificationTokens
                .FirstOrDefaultAsync(t => t.Token == token);

            if (existingToken != null)
            {
                // Update existing token
                existingToken.UserId = userId;
                existingToken.Platform = platform;
                existingToken.UpdatedAt = DateTime.UtcNow;
                _logger.LogInformation("Updated token for user: {UserId}", userId);
            }
            else
            {
                // Create new token
                var newToken = new NotificationTokenEntity
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Token = token,
                    Platform = platform,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.NotificationTokens.Add(newToken);
                _logger.LogInformation("Registered new token for user: {UserId}", userId);
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error registering token for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<Dictionary<string, List<string>>> GetUserTokensAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving user tokens dictionary using Entity Framework");
            var tokens = await _context.NotificationTokens
                .ToListAsync();

            var userTokens = tokens
                .GroupBy(t => t.UserId)
                .ToDictionary(g => g.Key, g => g.Select(t => t.Token).ToList());

            return userTokens;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user tokens dictionary");
            throw;
        }
    }

    public async Task<Dictionary<string, string>> GetTokenUsersAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving token users dictionary using Entity Framework");
            var tokens = await _context.NotificationTokens
                .ToListAsync();

            var tokenUsers = tokens.ToDictionary(t => t.Token, t => t.UserId);
            return tokenUsers;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving token users dictionary");
            throw;
        }
    }

    public async Task<(int totalUsers, int totalTokens)> GetTokenStatisticsAsync()
    {
        try
        {
            var totalTokens = await _context.NotificationTokens.CountAsync();
            var totalUsers = await _context.NotificationTokens
                .Select(t => t.UserId)
                .Distinct()
                .CountAsync();

            return (totalUsers, totalTokens);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving token statistics");
            throw;
        }
    }
}

