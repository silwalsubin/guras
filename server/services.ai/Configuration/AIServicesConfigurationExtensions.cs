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
            
            // Add headers to bypass Cloudflare blocking
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36");
            client.DefaultRequestHeaders.Add("Accept", "application/json");
            client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
            client.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
            client.DefaultRequestHeaders.Add("Pragma", "no-cache");
            
            // Log the configuration for debugging
            Console.WriteLine($"AI Service HttpClient configured with BaseAddress: {baseUrl}");
        });

        return services;
    }
}
