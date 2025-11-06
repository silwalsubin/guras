using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using utilities.ai.Configuration;
using utilities.ai.Services;
using System.Net;

namespace utilities.ai.Configuration;

public static class AIServicesConfigurationExtensions
{
    public static IServiceCollection AddAIServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Configure AI services
        services.Configure<AIServicesConfiguration>(configuration.GetSection("AIServices"));

        // Register HTTP client for OpenAI API with automatic decompression
        services.AddHttpClient<ISpiritualAIService, SpiritualAIService>(client =>
        {
            var config = configuration.GetSection("AIServices").Get<AIServicesConfiguration>();
            // Use just the domain as base URL, with v1 included in the endpoint paths
            var baseUrl = "https://api.openai.com";

            client.BaseAddress = new Uri(baseUrl);
            client.Timeout = TimeSpan.FromSeconds(config?.TimeoutSeconds ?? 30);

            // Add headers to bypass Cloudflare blocking
            client.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
            client.DefaultRequestHeaders.Add("Accept", "application/json, text/plain, */*");
            client.DefaultRequestHeaders.Add("Accept-Language", "en-US,en;q=0.9");
            client.DefaultRequestHeaders.Add("Accept-Encoding", "gzip, deflate");
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
        })
        .ConfigurePrimaryHttpMessageHandler(() =>
        {
            // Enable automatic decompression for gzip and deflate
            return new HttpClientHandler
            {
                AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate
            };
        });

        // Add memory cache for caching (used by meditation recommendation service)
        services.AddMemoryCache();

        return services;
    }
}
