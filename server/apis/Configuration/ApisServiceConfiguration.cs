using services.authentication.Configuration;
using services.aws.Configuration;
using services.quotes.Configuration;
using services.notifications.Configuration;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<DbConnectionProvider>();
        AuthenticationServicesConfiguration.ConfigureServices(services);
        AwsServicesConfiguration.ConfigureServices(services);
        QuotesServicesConfiguration.ConfigureServices(services);
        NotificationsServicesConfiguration.ConfigureServices(services);
        return services;
    }
}