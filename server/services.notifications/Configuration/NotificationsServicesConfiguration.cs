using Microsoft.Extensions.DependencyInjection;
using services.notifications.Services;

namespace services.notifications.Configuration;

public static class NotificationsServicesConfiguration
{
    public static IServiceCollection AddNotificationsServices(this IServiceCollection services)
    {
        services.AddScoped<INotificationTokenService, NotificationTokenService>();
        services.AddScoped<IUserNotificationPreferencesService, UserNotificationPreferencesService>();
        return services;
    }
} 