using services.users.Configuration;
using services.quotes.Configuration;
using services.notifications.Configuration;
using services.audio.Configuration;
using utilities.aws.Configuration;
using Microsoft.Extensions.Configuration;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureApiServices(this IServiceCollection services, IConfiguration configuration)
    {
        AuthenticationServicesConfigurationExtensions.ConfigureServices(services);
        services.AddAwsUtilities();
        services.AddQuotesServices(configuration);
        services.AddNotificationsServices(configuration);
        services.AddUserServices(configuration);
        services.AddAudioServices(configuration);
        return services;
    }
}
