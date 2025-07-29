using System.Text.Json;
using FirebaseAdmin.Messaging;

namespace apis.Services
{
    public class NotificationSchedulerService : BackgroundService
    {
        private readonly ILogger<NotificationSchedulerService> _logger;
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(5); // Check every 5 minutes

        public NotificationSchedulerService(
            ILogger<NotificationSchedulerService> logger,
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
                    var quote = GetRandomQuote();
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
            // TODO: Replace with actual database query
            // This should query your database to get FCM tokens for users who:
            // 1. Have notifications enabled
            // 2. Are due for a notification based on their frequency
            // 3. Are not in quiet hours
            
            _logger.LogDebug("Getting active user tokens from database");
            
            // Placeholder - return empty list for now
            return new List<string>();
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
                            Priority = NotificationPriority.High,
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

        private QuoteData GetRandomQuote()
        {
            // Sample quotes - in production, this would come from your quotes service/database
            var quotes = new List<QuoteData>
            {
                new() { Text = "Peace comes from within. Do not seek it without.", Author = "Buddha", Category = "inner-peace" },
                new() { Text = "The present moment is the only time over which we have any power.", Author = "Thich Nhat Hanh", Category = "mindfulness" },
                new() { Text = "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts.", Author = "Arianna Huffington", Category = "meditation" },
                new() { Text = "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", Author = "Rumi", Category = "self-love" },
                new() { Text = "The quieter you become, the more you are able to hear.", Author = "Ram Dass", Category = "awareness" }
            };

            var random = new Random();
            return quotes[random.Next(quotes.Count)];
        }
    }

    public class QuoteData
    {
        public string Text { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }
} 