using apis.Authentication;

namespace apis.Configuration;

public static class ApisServiceConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IFirebaseService, FirebaseService>();
        services.AddScoped<DbConnectionProvider>();
        return services;
    }
}