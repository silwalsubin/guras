using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.users.Data;
using services.users.Persistence;
using services.users.Services;

namespace services.users.Configuration;

public static class UserServicesConfigurationExtensions
{
    public static IServiceCollection AddUserServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<UsersDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString);
        });

        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Register services
        services.AddScoped<UserService>();

        return services;
    }
}
