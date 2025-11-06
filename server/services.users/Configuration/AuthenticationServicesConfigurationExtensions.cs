using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using services.users.Domain;
using services.users.Services;

namespace services.users.Configuration;

public static class AuthenticationServicesConfigurationExtensions
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IUserAuthService, FirebaseService>();
        return services;
    }

    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services)
    {
        services.AddAuthentication("Firebase")
            .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => { });
        return services;
    }
}
