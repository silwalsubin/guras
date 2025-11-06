using services.meditation.Domain;

namespace services.meditation.Services;

/// <summary>
/// Service interface for generating AI-powered personalized meditation recommendations
/// </summary>
public interface IMeditationRecommendationService
{
    /// <summary>
    /// Generate personalized meditation recommendations for a user
    /// </summary>
    Task<List<MeditationRecommendationDto>> GenerateRecommendationsAsync(Guid userId, int count = 3);

    /// <summary>
    /// Get recommendation reason/explanation
    /// </summary>
    Task<string> GetRecommendationReasonAsync(Guid userId, string sessionTitle);
}

