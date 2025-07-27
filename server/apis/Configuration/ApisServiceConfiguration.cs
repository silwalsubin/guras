using apis.Authentication;
using apis.Services;
using Amazon.S3;
using Amazon.Extensions.NETCore.Setup;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IFirebaseService, FirebaseService>();
        services.AddScoped<DbConnectionProvider>();
        
        // Register AWS S3 service
        services.AddDefaultAWSOptions(new AWSOptions());
        services.AddAWSService<IAmazonS3>();
        services.AddScoped<IS3Service, S3Service>();
        
        return services;
    }
}