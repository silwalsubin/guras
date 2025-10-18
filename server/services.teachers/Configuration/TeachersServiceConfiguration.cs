using Microsoft.Extensions.DependencyInjection;
using services.teachers.Repositories;
using services.teachers.Services;

namespace services.teachers.Configuration;

public static class TeachersServiceConfiguration
{
    public static IServiceCollection AddTeachersServices(this IServiceCollection services)
    {
        // Register repositories
        services.AddScoped<ITeacherRepository, TeacherRepository>();
        
        // Register services
        services.AddScoped<ITeacherService, TeacherService>();
        
        return services;
    }
}
