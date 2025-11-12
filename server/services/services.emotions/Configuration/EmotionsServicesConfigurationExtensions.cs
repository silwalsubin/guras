using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using services.emotions.Services;
using services.emotions.Data;
using services.emotions.Repositories;
using utilities.Persistence.ConnectionFactories;

namespace services.emotions.Configuration;

public static class EmotionsServicesConfigurationExtensions
{
    public static IServiceCollection AddEmotionsServices(this IServiceCollection services, IDbConnectionFactory connectionFactory)
    {
        // Register DbContext
        services.AddDbContext<EmotionsDbContext>(options =>
        {
            options.UseNpgsql(connectionFactory.GetConnectionString());
        });

        // Register repository
        services.AddScoped<IEmotionRepository, EmotionRepository>();

        // Register services
        services.AddScoped<IEmotionService, EmotionService>();

        return services;
    }
}

