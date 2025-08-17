using Microsoft.Extensions.DependencyInjection;
using services.audio.Repositories;
using services.audio.Services;

namespace services.audio.Configuration;

public static class AudioServicesConfiguration
{
    public static IServiceCollection AddAudioServices(this IServiceCollection services)
    {
        services.AddScoped<IAudioFileRepository, AudioFileRepository>();
        services.AddScoped<IAudioFileService, AudioFileService>();
        
        return services;
    }
}
