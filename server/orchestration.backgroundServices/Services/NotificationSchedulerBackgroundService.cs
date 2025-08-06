using System.Text.Json;
using FirebaseAdmin.Messaging;
using Microsoft.Extensions.DependencyInjection;
using services.quotes.Services;
using services.quotes.Domain;

namespace orchestration.backgroundServices.Services;

public class NotificationSchedulerBackgroundService : BackgroundService
{
    private readonly ILogger<NotificationSchedulerBackgroundService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

    public NotificationSchedulerBackgroundService(
        ILogger<NotificationSchedulerBackgroundService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Scheduler Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendScheduledNotifications();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in notification scheduler");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Notification Scheduler Service stopped");
    }

    private async Task CheckAndSendScheduledNotifications()
    {
        try
        {
            // Get current time
            var now = DateTime.UtcNow;
            _logger.LogDebug($"Checking for scheduled notifications at {now:yyyy-MM-dd HH:mm:ss} UTC");

            // TODO: Get users who have notifications enabled and are due for a notification
            // This would typically query your database for:
            // 1. Users with notifications enabled
            // 2. Users whose last notification was sent according to their frequency preference
            // 3. Users not in quiet hours

            // For demo purposes, let's simulate getting user tokens
            var userTokens = await GetActiveUserTokens();

            if (userTokens.Any())
            {
                using var scope = _scopeFactory.CreateScope();
                var quotesService = scope.ServiceProvider.GetRequiredService<IQuotesService>();
                var quote = quotesService.GetRandomQuote();
                await SendQuoteNotificationToUsers(userTokens, quote);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking scheduled notifications");
        }
    }

    private async Task<List<string>> GetActiveUserTokens()
    {
        try
        {
            // For now, get tokens from the NotificationController's in-memory storage
            // In production, this would query the database
            _logger.LogDebug("Getting active user tokens from memory storage");
            
            // Access the static tokens from NotificationController
            var tokens = apis.Controllers.NotificationController.GetStoredTokens();
            _logger.LogInformation($"Found {tokens.Count} registered tokens");
            
            return tokens;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting active user tokens");
            return new List<string>();
        }
    }

    private async Task SendQuoteNotificationToUsers(List<string> userTokens, QuoteData quote)
    {
        try
        {
            _logger.LogInformation($"Sending quote notification to {userTokens.Count} users");

            var messages = userTokens.Select(token => new Message()
            {
                Token = token,
                Notification = new Notification()
                {
                    Title = "🧘 Daily Wisdom",
                    Body = $"\"{quote.Text}\" - {quote.Author}"
                },
                Data = new Dictionary<string, string>
                {
                    ["quote"] = JsonSerializer.Serialize(quote),
                    ["type"] = "daily_quote",
                    ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()
                },
                Android = new AndroidConfig()
                {
                    Notification = new AndroidNotification()
                    {
                        Sound = "default",
                        Priority = NotificationPriority.HIGH,
                        ChannelId = "daily-quotes"
                    }
                },
                Apns = new ApnsConfig()
                {
                    Aps = new Aps()
                    {
                        Sound = "default",
                        Badge = 1
                    }
                }
            }).ToList();

            var response = await FirebaseMessaging.DefaultInstance.SendAllAsync(messages);
            _logger.LogInformation($"Quote notifications sent: {response.SuccessCount} successful, {response.FailureCount} failed");

            // TODO: Update database with last notification sent time for each user
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending quote notifications to users");
        }
    }
} 