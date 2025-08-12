using Microsoft.Extensions.DependencyInjection;
using services.Services;
using services.Persistence;

namespace services.Configuration;

public static class UserServicesConfiguration
{
    public static IServiceCollection AddUserServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<UserService>();
        return services;
    }
}
