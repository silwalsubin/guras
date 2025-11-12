using services.emotions.Domain;

namespace services.emotions.Services;

public interface IEmotionService
{
    /// <summary>
    /// Get all emotions
    /// </summary>
    Task<List<EmotionResponse>> GetAllEmotionsAsync();

    /// <summary>
    /// Get emotion by ID
    /// </summary>
    Task<EmotionResponse?> GetEmotionByIdAsync(string id);

    /// <summary>
    /// Get emotion by name
    /// </summary>
    Task<EmotionResponse?> GetEmotionByNameAsync(string name);

    /// <summary>
    /// Get color for an emotion by name
    /// </summary>
    Task<string?> GetEmotionColorAsync(string emotionName);

    /// <summary>
    /// Get emotions by list of IDs
    /// </summary>
    Task<List<EmotionResponse>> GetEmotionsByIdsAsync(List<string> ids);
}

