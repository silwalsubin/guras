using Amazon.S3;
using Microsoft.Extensions.DependencyInjection;
using utilities.aws.Utilities;
using utilities.HostEnvironment;
using utilities.Persistence.ConnectionFactories;

namespace utilities.aws.Configuration;

public static class AwsServicesConfiguration
{
    public static IServiceCollection AddAwsUtilities(this IServiceCollection services)
    {
        services.AddScoped<IAmazonS3, AmazonS3Client>();
        services.AddScoped<IS3Service, S3Service>();
        services.AddScoped<AudioFilesUtility>();
        // Note: IDbConnectionFactory is registered in Program.cs as a singleton
        return services;
    }
}
