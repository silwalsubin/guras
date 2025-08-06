using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.DependencyInjection;
using services.authentication.Domain;
using services.authentication.Services;
using IAuthenticationService = services.authentication.Services.IAuthenticationService;

namespace services.authentication.Configuration;

public static class AuthenticationServicesConfiguration
{
    public static IServiceCollection ConfigureServices(this IServiceCollection services)
    {
        services.AddScoped<IAuthenticationService, FirebaseService>();
        return services;
    }

    public static IServiceCollection AddAuthenticationServices(this IServiceCollection services)
    {
        services.AddAuthentication("Firebase")
            .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => { });
        return services;
    }
}