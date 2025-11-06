using services.meditation.Domain;

namespace services.meditation.Repositories;

public interface IMeditationAnalyticsRepository
{
    Task<MeditationAnalytics> CreateAsync(MeditationAnalytics analytics);
    Task<MeditationAnalytics?> GetByIdAsync(Guid id);
    Task<List<MeditationAnalytics>> GetByUserIdAsync(Guid userId, int limit = 50);
    Task<bool> UpdateAsync(MeditationAnalytics analytics);
    Task<MeditationPatternsDto> GetUserPatternsAsync(Guid userId);
    Task<MeditationStatsDto> GetUserStatsAsync(Guid userId);
}

