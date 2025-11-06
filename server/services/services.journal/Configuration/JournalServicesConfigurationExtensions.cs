using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.journal.Data;
using services.journal.Repositories;
using services.journal.Services;
using utilities.Persistence;
using utilities.Persistence.ConnectionFactories;

namespace services.journal.Configuration;

/// <summary>
/// Extension methods for configuring journal services
/// </summary>
public static class JournalServicesConfigurationExtensions
{
    /// <summary>
    /// Add journal services to the dependency injection container
    /// </summary>
    public static IServiceCollection AddJournalServices(this IServiceCollection services, IConfiguration configuration, IDbConnectionFactory connectionFactory)
    {
        // Register DbContext
        services.AddDbContext<JournalEntriesDbContext>(options =>
        {
            options.UseNpgsql(connectionFactory.GetConnectionString());
        });

        // Register repositories
        services.AddScoped<IJournalEntryRepository, JournalEntryRepository>();

        // Register services
        services.AddScoped<IJournalEntryService, JournalEntryService>();

        return services;
    }
}

