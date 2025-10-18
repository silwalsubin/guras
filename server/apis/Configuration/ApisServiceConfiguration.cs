using services.users.Configuration;
using services.quotes.Configuration;
using services.notifications.Configuration;
using services.audio.Configuration;
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
        services.AddAudioServices();
        return services;
    }
}
