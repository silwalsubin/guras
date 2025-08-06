using Microsoft.Extensions.DependencyInjection;
using services.notifications.Services;

namespace services.notifications.Configuration;

public static class NotificationsServicesConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<INotificationTokenService, NotificationTokenService>();
        return services;
    }
} 