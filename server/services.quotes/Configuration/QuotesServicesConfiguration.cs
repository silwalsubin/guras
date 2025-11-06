using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.quotes.Data;
using services.quotes.Repositories;
using services.quotes.Services;

namespace services.quotes.Configuration;

public static class QuotesServicesConfiguration
{
    public static IServiceCollection AddQuotesServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<QuotesDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString);
        });

        // Register repositories
        services.AddScoped<IQuoteRepository, QuoteRepository>();

        // Register services
        services.AddScoped<IQuotesService, QuotesService>();

        return services;
    }
}
