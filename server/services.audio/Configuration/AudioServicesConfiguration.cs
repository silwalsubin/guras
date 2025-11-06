using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using services.audio.Data;
using services.audio.Repositories;
using services.audio.Services;

namespace services.audio.Configuration;

public static class AudioServicesConfiguration
{
    public static IServiceCollection AddAudioServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Register DbContext
        services.AddDbContext<AudioFilesDbContext>(options =>
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            options.UseNpgsql(connectionString);
        });

        // Register repositories
        services.AddScoped<IAudioFileRepository, AudioFileRepository>();

        // Register services
        services.AddScoped<IAudioFileService, AudioFileService>();

        return services;
    }
}
