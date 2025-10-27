using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using services.meditation.Services;
using utilities.Persistence;
using utilities.Persistence.ConnectionFactories;

namespace services.meditation.Configuration;

public static class MeditationServicesConfigurationExtensions
{
    public static IServiceCollection AddMeditationServices(this IServiceCollection services)
    {
        // Register meditation analytics service
        services.AddScoped<IMeditationAnalyticsService>(provider =>
        {
            var dbConfig = provider.GetRequiredService<DbConfiguration>();
            var connection = dbConfig.GetConnection();
            var logger = provider.GetRequiredService<ILogger<MeditationAnalyticsService>>();
            return new MeditationAnalyticsService(connection, logger);
        });

        return services;
    }
}

