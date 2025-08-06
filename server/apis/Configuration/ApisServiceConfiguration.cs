using apis.Services;
using Amazon.S3;
using services.authentication.Configuration;
using services.aws;
using services.aws.Configuration;
using services.quotes.Configuration;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<DbConnectionProvider>();
        AuthenticationServicesConfiguration.ConfigureServices(services);
        AwsServicesConfiguration.ConfigureServices(services);
        QuotesServicesConfiguration.ConfigureServices(services);
        return services;
    }
}