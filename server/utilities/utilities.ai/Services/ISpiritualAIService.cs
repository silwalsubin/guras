using utilities.ai.Domain;

namespace utilities.ai.Services;

public interface ISpiritualAIService
{
    Task<AIResponse> GenerateResponseAsync(AIRequest request);
    Task<AIResponse> GenerateDailyGuidanceAsync(string teacherId, string userId);
    Task<bool> IsServiceAvailableAsync();
    Task<Dictionary<string, object>> GetServiceStatsAsync();

    /// <summary>
    /// Generate personalized meditation recommendations based on user context
    /// </summary>
    Task<string> GenerateRecommendationAsync(string prompt);

    /// <summary>
    /// Generate a short AI title from journal entry content
    /// </summary>
    Task<string> GenerateJournalTitleAsync(string content);

    /// <summary>
    /// Analyze journal entry content and determine mood
    /// </summary>
    Task<(string mood, int moodScore)> AnalyzeJournalMoodAsync(string content);
}
