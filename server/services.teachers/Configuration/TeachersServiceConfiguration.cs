using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.teachers.Data;
using services.teachers.Repositories;
using services.teachers.Services;

namespace services.teachers.Configuration;

public static class TeachersServiceConfiguration
{
    public static IServiceCollection AddTeachersServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<TeachersDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString);
        });

        // Register repositories
        services.AddScoped<ITeacherRepository, TeacherRepository>();

        // Register services
        services.AddScoped<ITeacherService, TeacherService>();

        return services;
    }
}
