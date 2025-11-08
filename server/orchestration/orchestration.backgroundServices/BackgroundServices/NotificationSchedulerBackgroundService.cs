using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace orchestration.backgroundServices.BackgroundServices;

public class NotificationSchedulerBackgroundService : BackgroundService
{
    private readonly ILogger<NotificationSchedulerBackgroundService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public NotificationSchedulerBackgroundService(ILogger<NotificationSchedulerBackgroundService> logger)
    {
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Notification Scheduler Background Service started (quotes disabled)");

        while (!stoppingToken.IsCancellationRequested)
        {
            await CheckAndSendNotifications();
            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("Notification Scheduler Background Service stopped");
    }

    private Task CheckAndSendNotifications()
    {
        _logger.LogInformation("Quote-based notifications are retired; scheduler check skipped.");
        return Task.CompletedTask;
    }
}