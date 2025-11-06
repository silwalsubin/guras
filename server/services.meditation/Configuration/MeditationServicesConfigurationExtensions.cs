using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.meditation.Data;
using services.meditation.Repositories;
using services.meditation.Services;

namespace services.meditation.Configuration;

public static class MeditationServicesConfigurationExtensions
{
    public static IServiceCollection AddMeditationServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<MeditationAnalyticsDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString);
        });

        // Register repositories
        services.AddScoped<IMeditationAnalyticsRepository, MeditationAnalyticsRepository>();

        // Register services
        services.AddScoped<IMeditationAnalyticsService, MeditationAnalyticsService>();

        return services;
    }
}

