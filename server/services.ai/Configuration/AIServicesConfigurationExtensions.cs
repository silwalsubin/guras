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
            var baseUrl = config?.OpenAIBaseUrl ?? "https://api.openai.com/v1";
            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromSeconds(config?.TimeoutSeconds ?? 30);
            
            // Log the configuration for debugging
            Console.WriteLine($"AI Service HttpClient configured with BaseAddress: {baseUrl}");
        });

        return services;
    }
}
