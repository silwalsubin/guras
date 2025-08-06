using Microsoft.Extensions.DependencyInjection;
using services.quotes.Services;

namespace services.quotes.Configuration;

public static class QuotesServicesConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IQuotesService, QuotesService>();
        
        return services;
    }
} 