using System.Text.Json;
using FirebaseAdmin.Messaging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using services.notifications.Services;
using services.notifications.Domain;
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
            _logger.LogInformation($"Checking for scheduled notifications at {now:yyyy-MM-dd HH:mm:ss} UTC");

            using var scope = _scopeFactory.CreateScope();
            var preferencesService = scope.ServiceProvider.GetRequiredService<IUserNotificationPreferencesService>();
            var tokenService = scope.ServiceProvider.GetRequiredService<INotificationTokenService>();
            var quotesService = scope.ServiceProvider.GetRequiredService<IQuotesService>();

            // Get all user preferences for debugging
            var allPreferences = await preferencesService.GetAllUserPreferencesAsync();
            _logger.LogInformation($"Total users with preferences: {allPreferences.Count}");
            
            foreach (var pref in allPreferences)
            {
                _logger.LogInformation($"User {pref.UserId}: Enabled={pref.Enabled}, Frequency={pref.Frequency}, LastSent={pref.LastNotificationSent:yyyy-MM-dd HH:mm:ss} UTC");
            }

            // Get users who are due for notifications based on their preferences
            var usersDueForNotification = await preferencesService.GetUsersDueForNotificationAsync();

            if (usersDueForNotification.Any())
            {
                _logger.LogInformation("Found {Count} users due for notifications", usersDueForNotification.Count);
                
                foreach (var userPreferences in usersDueForNotification)
                {
                    _logger.LogInformation($"User {userPreferences.UserId} is due for {userPreferences.Frequency} notification");
                    await SendScheduledQuoteNotificationToUser(userPreferences, tokenService, preferencesService, quotesService);
                }
            }
            else
            {
                _logger.LogInformation("No users due for notifications at this time");
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking scheduled notifications");
        }
    }

    private async Task SendScheduledQuoteNotificationToUser(
        UserNotificationPreferences userPreferences, 
        INotificationTokenService tokenService,
        IUserNotificationPreferencesService preferencesService,
        IQuotesService quotesService)
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

            // Get a random quote for this notification
            var quote = quotesService.GetRandomQuote();
            _logger.LogInformation($"Sending quote notification to user {userPreferences.UserId} with {tokens.Count} tokens. Quote: \"{quote.Text}\" - {quote.Author}");

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
                    ["frequency"] = userPreferences.Frequency.ToString(),
                    ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString(),
                    ["message"] = "scheduled_quote"
                },
                Android = new AndroidConfig()
                {
                    Notification = new AndroidNotification()
                    {
                        Sound = "default",
                        Priority = NotificationPriority.HIGH,
                        ChannelId = "scheduled-notifications"
                    }
                },
                Apns = new ApnsConfig()
                {
                    Aps = new Aps()
                    {
                        Sound = "default",
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

            // Use SendAsync in a loop instead of SendAllAsync to avoid 404 batch endpoint issues
            var successCount = 0;
            var failureCount = 0;

            foreach (var message in messages)
            {
                try
                {
                    var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                    successCount++;
                    _logger.LogInformation($"Quote notification sent successfully to user {userPreferences.UserId} with token: {message.Token[..20]}...");
                }
                catch (Exception ex)
                {
                    failureCount++;
                    _logger.LogError(ex, $"Failed to send quote notification to user {userPreferences.UserId} with token {message.Token[..20]}...");
                }
            }

            _logger.LogInformation($"Quote notifications sent to user {userPreferences.UserId}: {successCount} successful, {failureCount} failed");

            // Update the user's last notification sent time
            if (successCount > 0)
            {
                await preferencesService.UpdateLastNotificationSentAsync(userPreferences.UserId);
                _logger.LogInformation($"Updated last notification time for user {userPreferences.UserId} to {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
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