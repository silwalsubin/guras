using Microsoft.Extensions.DependencyInjection;
using services.users.Persistence;
using services.users.Services;

namespace services.users.Configuration;

public static class UserServicesConfiguration
{
    public static IServiceCollection AddUserServices(this IServiceCollection services)
    {
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<UserService>();
        return services;
    }
}
