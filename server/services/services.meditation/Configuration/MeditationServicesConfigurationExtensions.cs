using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.meditation.Data;
using services.meditation.Repositories;
using services.meditation.Services;
using utilities.Persistence;
using utilities.Persistence.ConnectionFactories;

namespace services.meditation.Configuration;

public static class MeditationServicesConfigurationExtensions
{
    public static IServiceCollection AddMeditationServices(this IServiceCollection services, IConfiguration configuration, IDbConnectionFactory connectionFactory)
    {
        // Register DbContext
        services.AddDbContext<MeditationAnalyticsDbContext>(options =>
        {
            options.UseNpgsql(connectionFactory.GetConnectionString());
        });

        // Register repositories
        services.AddScoped<IMeditationAnalyticsRepository, MeditationAnalyticsRepository>();

        // Register services
        services.AddScoped<IMeditationAnalyticsService, MeditationAnalyticsService>();
        
        // Register meditation recommendation service (requires ISpiritualAIService from utilities.ai)
        services.AddScoped<IMeditationRecommendationService, MeditationRecommendationService>();
        
        // Add memory cache for recommendation caching
        services.AddMemoryCache();

        return services;
    }
}

