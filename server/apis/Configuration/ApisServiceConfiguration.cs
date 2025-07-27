using apis.Authentication;
using apis.Services;
using Amazon.S3;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IFirebaseService, FirebaseService>();
        services.AddScoped<DbConnectionProvider>();
        
        // Register AWS S3 service
        services.AddScoped<IAmazonS3, AmazonS3Client>();
        services.AddScoped<IS3Service, S3Service>();
        
        return services;
    }
}