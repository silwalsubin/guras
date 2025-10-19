using services.ai.Domain;

namespace services.ai.Services;

public interface ISpiritualAIService
{
    Task<AIResponse> GenerateResponseAsync(AIRequest request);
    Task<AIResponse> GenerateDailyGuidanceAsync(string teacherId, string userId);
    Task<bool> IsServiceAvailableAsync();
    Task<Dictionary<string, object>> GetServiceStatsAsync();
}
