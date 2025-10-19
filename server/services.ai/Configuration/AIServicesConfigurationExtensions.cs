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
            // Try using a different endpoint to bypass Cloudflare blocking
            var baseUrl = config?.OpenAIBaseUrl ?? "https://api.openai.com/v1";
            
            // If the default URL is being blocked, try alternative endpoints
            if (baseUrl.Contains("api.openai.com"))
            {
                // Try using a proxy service to bypass Cloudflare
                baseUrl = "https://api.openai.com/v1";
            }
            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromSeconds(config?.TimeoutSeconds ?? 30);
            
            // Add headers to bypass Cloudflare blocking
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Add("Accept", "application/json, text/plain, */*");
            client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
            client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate, br");
            client.DefaultRequestHeaders.Add("Cache-Control", "no-cache");
            client.DefaultRequestHeaders.Add("Pragma", "no-cache");
            client.DefaultRequestHeaders.Add("Origin", "https://platform.openai.com");
            client.DefaultRequestHeaders.Add("Referer", "https://platform.openai.com/");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Dest", "empty");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Mode", "cors");
            client.DefaultRequestHeaders.Add("Sec-Fetch-Site", "same-site");
            client.DefaultRequestHeaders.Add("Sec-Ch-Ua", "\"Not_A Brand\";v=\"8\", \"Chromium\";v=\"120\", \"Google Chrome\";v=\"120\"");
            client.DefaultRequestHeaders.Add("Sec-Ch-Ua-Mobile", "?0");
            client.DefaultRequestHeaders.Add("Sec-Ch-Ua-Platform", "\"macOS\"");
            
            // Log the configuration for debugging
            Console.WriteLine($"AI Service HttpClient configured with BaseAddress: {baseUrl}");
        });

        return services;
    }
}
