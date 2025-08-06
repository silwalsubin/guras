using Amazon.S3;
using Microsoft.Extensions.DependencyInjection;
using services.aws.Services;
using services.aws.Utilities;

namespace services.aws.Configuration;

public static class AwsServicesConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IAmazonS3, AmazonS3Client>();
        services.AddScoped<IS3Service, S3Service>();
        services.AddScoped<AudioFilesService>();
        return services;
    }
}