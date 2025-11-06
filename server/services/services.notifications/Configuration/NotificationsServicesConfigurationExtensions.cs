using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.notifications.Data;
using services.notifications.Repositories;
using services.notifications.Services;
using utilities.Persistence;

namespace services.notifications.Configuration;

public static class NotificationsServicesConfigurationExtensions
{
    public static IServiceCollection AddNotificationsServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<NotificationsDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetDatabaseConnectionString());
        });

        // Register repositories
        services.AddScoped<INotificationTokenRepository, NotificationTokenRepository>();
        services.AddScoped<IUserNotificationPreferencesRepository, UserNotificationPreferencesRepository>();

        // Register services
        services.AddScoped<INotificationTokenService, NotificationTokenService>();
        services.AddScoped<IUserNotificationPreferencesService, UserNotificationPreferencesService>();

        return services;
    }
}
