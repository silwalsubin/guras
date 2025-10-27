using Microsoft.Extensions.DependencyInjection;
using services.journal.Repositories;
using services.journal.Services;

namespace services.journal.Configuration;

/// <summary>
/// Extension methods for configuring journal services
/// </summary>
public static class JournalServicesConfigurationExtensions
{
    /// <summary>
    /// Add journal services to the dependency injection container
    /// </summary>
    public static IServiceCollection AddJournalServices(this IServiceCollection services)
    {
        services.AddScoped<IJournalEntryRepository, JournalEntryRepository>();
        services.AddScoped<IJournalEntryService, JournalEntryService>();

        return services;
    }
}

