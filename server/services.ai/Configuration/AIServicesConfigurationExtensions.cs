using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.ai.Configuration;
using services.ai.Services;

namespace services.ai.Configuration;

public static class AIServicesConfigurationExtensions
{
    public static IServiceCollection AddAIServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure AI services
        services.Configure<AIServicesConfiguration>(configuration.GetSection("AIServices"));
        
        // Register HTTP client for OpenAI API
        services.AddHttpClient<ISpiritualAIService, SpiritualAIService>(client =>
        {
            var config = configuration.GetSection("AIServices").Get<AIServicesConfiguration>();
            client.BaseAddress = new Uri(config?.OpenAIBaseUrl ?? "https://api.openai.com/v1");
            client.Timeout = TimeSpan.FromSeconds(config?.TimeoutSeconds ?? 30);
        });

        // Register AI service
        services.AddScoped<ISpiritualAIService, SpiritualAIService>();

        return services;
    }
}
