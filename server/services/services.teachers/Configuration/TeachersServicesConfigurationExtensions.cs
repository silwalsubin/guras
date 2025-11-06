using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.teachers.Data;
using services.teachers.Repositories;
using services.teachers.Services;
using utilities.Persistence;
using utilities.Persistence.ConnectionFactories;

namespace services.teachers.Configuration;

public static class TeachersServicesConfigurationExtensions
{
    public static IServiceCollection AddTeachersServices(this IServiceCollection services, IConfiguration configuration, IDbConnectionFactory connectionFactory)
    {
        // Register DbContext
        services.AddDbContext<TeachersDbContext>(options =>
        {
            options.UseNpgsql(connectionFactory.GetConnectionString());
        });

        // Register repositories
        services.AddScoped<ITeacherRepository, TeacherRepository>();

        // Register services
        services.AddScoped<ITeacherService, TeacherService>();

        return services;
    }
}
