using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.users.Data;
using services.users.Repositories;
using services.users.Services;
using utilities.Persistence;
using utilities.Persistence.ConnectionFactories;

namespace services.users.Configuration;

public static class UserServicesConfigurationExtensions
{
    public static IServiceCollection AddUserServices(this IServiceCollection services, IConfiguration configuration, IDbConnectionFactory connectionFactory)
    {
        // Register DbContext
        services.AddDbContext<UsersDbContext>(options =>
        {
            options.UseNpgsql(connectionFactory.GetConnectionString());
        });

        // Register repositories
        services.AddScoped<IUserRepository, UserRepository>();

        // Register services
        services.AddScoped<IUserService, UserService>();

        return services;
    }
}
