using System.Text.Json;
using FirebaseAdmin.Messaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using services.notifications.Services;
using services.notifications.Domain;
using services.quotes.Domain;
using services.quotes.Services;

namespace orchestration.backgroundServices.BackgroundServices;

public class NotificationSchedulerBackgroundService : BackgroundService
{
    private readonly ILogger<NotificationSchedulerBackgroundService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1); // Check every minute

    public NotificationSchedulerBackgroundService(
        ILogger<NotificationSchedulerBackgroundService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Scheduler Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await CheckAndSendNotifications();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in notification scheduler loop");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Notification Scheduler Background Service stopped");
    }

    private async Task CheckAndSendNotifications()
    {
        try
        {
            // Get current time
            var now = DateTime.UtcNow;
            _logger.LogDebug($"Checking for scheduled notifications at {now:yyyy-MM-dd HH:mm:ss} UTC");

            using var scope = _scopeFactory.CreateScope();
            var preferencesService = scope.ServiceProvider.GetRequiredService<IUserNotificationPreferencesService>();
            var quotesService = scope.ServiceProvider.GetRequiredService<IQuotesService>();
            var tokenService = scope.ServiceProvider.GetRequiredService<INotificationTokenService>();

            // Get users who are due for notifications based on their preferences
            var usersDueForNotification = await preferencesService.GetUsersDueForNotificationAsync();

            if (usersDueForNotification.Any())
            {
                _logger.LogInformation("Found {Count} users due for notifications", usersDueForNotification.Count);
                
                // Get a random quote for this notification cycle
                var quote = quotesService.GetRandomQuote();
                
                foreach (var userPreferences in usersDueForNotification)
                {
                    await SendQuoteNotificationToUser(userPreferences, quote, tokenService, preferencesService);
                }
            }
            else
            {
                _logger.LogDebug("No users due for notifications at this time");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking scheduled notifications");
        }
    }

    private async Task SendQuoteNotificationToUser(
        UserNotificationPreferences userPreferences, 
        QuoteData quote, 
        INotificationTokenService tokenService,
        IUserNotificationPreferencesService preferencesService)
    {
        try
        {
            // Get user's FCM tokens
            var userTokens = tokenService.GetUserTokens();
            if (!userTokens.TryGetValue(userPreferences.UserId, out var tokens) || !tokens.Any())
            {
                _logger.LogWarning("No FCM tokens found for user {UserId}", userPreferences.UserId);
                return;
            }

            _logger.LogInformation($"Sending quote notification to user {userPreferences.UserId} with {tokens.Count} tokens");

            var messages = tokens.Select(token => new Message()
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
                    ["type"] = GetNotificationType(userPreferences.Frequency),
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
                        Badge = 1,
                        ContentAvailable = true,
                        Alert = new ApsAlert()
                        {
                            Title = "🧘 Daily Wisdom",
                            Body = $"\"{quote.Text}\" - {quote.Author}"
                        }
                    },
                    Headers = new Dictionary<string, string>
                    {
                        ["apns-priority"] = "10",
                        ["apns-push-type"] = "alert"
                    }
                }
            }).ToList();

            var response = await FirebaseMessaging.DefaultInstance.SendAllAsync(messages);
            _logger.LogInformation($"Quote notifications sent to user {userPreferences.UserId}: {response.SuccessCount} successful, {response.FailureCount} failed");

            // Update the user's last notification sent time
            if (response.SuccessCount > 0)
            {
                await preferencesService.UpdateLastNotificationSentAsync(userPreferences.UserId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending quote notification to user {UserId}", userPreferences.UserId);
        }
    }

    private string GetNotificationType(NotificationFrequency frequency)
    {
        return frequency switch
        {
            NotificationFrequency.FiveMinutes => "5min_quote",
            NotificationFrequency.Hourly => "hourly_quote",
            NotificationFrequency.TwiceDaily => "twice_daily_quote",
            NotificationFrequency.Daily => "daily_quote",
            _ => "daily_quote"
        };
    }
} 