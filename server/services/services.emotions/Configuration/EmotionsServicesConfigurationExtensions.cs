using Microsoft.Extensions.DependencyInjection;
using services.emotions.Services;

namespace services.emotions.Configuration;

public static class EmotionsServicesConfigurationExtensions
{
    public static IServiceCollection AddEmotionsServices(this IServiceCollection services)
    {
        // Register services
        services.AddScoped<IEmotionService, EmotionService>();

        return services;
    }
}

