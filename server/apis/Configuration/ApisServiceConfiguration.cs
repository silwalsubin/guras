using services.authentication.Configuration;
using services.quotes.Configuration;
using services.notifications.Configuration;
using services.Configuration;
using utilities.aws.Configuration;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureApiServices(this IServiceCollection services)
    {
        AuthenticationServicesConfiguration.ConfigureServices(services);
        services.AddAwsUtilities();
        QuotesServicesConfiguration.ConfigureServices(services);
        services.AddNotificationsServices();
        services.AddUserServices();
        return services;
    }
}