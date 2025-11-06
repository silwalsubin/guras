using services.users.Configuration;
using services.quotes.Configuration;
using services.notifications.Configuration;
using services.audio.Configuration;
using utilities.aws.Configuration;
using utilities.Persistence.ConnectionFactories;
using Microsoft.Extensions.Configuration;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureApiServices(this IServiceCollection services, IConfiguration configuration, IDbConnectionFactory connectionFactory)
    {
        AuthenticationServicesConfigurationExtensions.ConfigureServices(services);
        services.AddAwsUtilities();
        services.AddQuotesServices(configuration, connectionFactory);
        services.AddNotificationsServices(configuration, connectionFactory);
        services.AddUserServices(configuration, connectionFactory);
        services.AddAudioServices(configuration, connectionFactory);
        return services;
    }
}
