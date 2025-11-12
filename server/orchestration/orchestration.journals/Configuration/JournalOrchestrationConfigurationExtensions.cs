using Microsoft.Extensions.DependencyInjection;
using orchestration.journals.Services;

namespace orchestration.journals.Configuration;

/// <summary>
/// Extension methods for registering journal orchestration services
/// </summary>
public static class JournalOrchestrationConfigurationExtensions
{
    /// <summary>
    /// Add journal orchestration services to the dependency injection container
    /// </summary>
    public static IServiceCollection AddJournalOrchestrationServices(this IServiceCollection services)
    {
        services.AddScoped<IJournalOrchestrationService, JournalOrchestrationService>();
        return services;
    }
}

