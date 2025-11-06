using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.quotes.Data;
using services.quotes.Repositories;
using services.quotes.Services;
using utilities.Persistence;

namespace services.quotes.Configuration;

public static class QuotesServicesConfigurationExtensions
{
    public static IServiceCollection AddQuotesServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<QuotesDbContext>(options =>
        {
            options.UseNpgsql(configuration.GetDatabaseConnectionString());
        });

        // Register repositories
        services.AddScoped<IQuoteRepository, QuoteRepository>();

        // Register services
        services.AddScoped<IQuotesService, QuotesService>();

        return services;
    }
}
