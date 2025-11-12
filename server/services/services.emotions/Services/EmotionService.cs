using services.emotions.Domain;
using Microsoft.Extensions.Logging;

namespace services.emotions.Services;

public class EmotionService : IEmotionService
{
    private readonly ILogger<EmotionService> _logger;

    // Hardcoded emotions stored in memory
    private readonly List<Emotion> _emotions = new()
    {
        new Emotion
        {
            Id = "happy",
            Name = "Happy",
            Color = "#10B981",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
        new Emotion
        {
            Id = "calm",
            Name = "Calm",
            Color = "#3B82F6",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
        new Emotion
        {
            Id = "anxious",
            Name = "Anxious",
            Color = "#F59E0B",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
        new Emotion
        {
            Id = "sad",
            Name = "Sad",
            Color = "#8B5CF6",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
        new Emotion
        {
            Id = "excited",
            Name = "Excited",
            Color = "#EC4899",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
        new Emotion
        {
            Id = "angry",
            Name = "Angry",
            Color = "#EF4444",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow,
        },
    };

    public EmotionService(ILogger<EmotionService> logger)
    {
        _logger = logger;
    }

    public Task<List<EmotionResponse>> GetAllEmotionsAsync()
    {
        _logger.LogInformation("Fetching all emotions");
        var responses = _emotions
            .Where(e => e.IsActive)
            .Select(MapToResponse)
            .ToList();
        return Task.FromResult(responses);
    }

    public Task<EmotionResponse?> GetEmotionByIdAsync(string id)
    {
        _logger.LogInformation("Fetching emotion by ID: {EmotionId}", id);
        var emotion = _emotions.FirstOrDefault(e => e.Id == id && e.IsActive);
        return Task.FromResult(emotion != null ? MapToResponse(emotion) : null);
    }

    public Task<EmotionResponse?> GetEmotionByNameAsync(string name)
    {
        _logger.LogInformation("Fetching emotion by name: {EmotionName}", name);
        var emotion = _emotions.FirstOrDefault(e =>
            e.Name.Equals(name, StringComparison.OrdinalIgnoreCase) && e.IsActive);
        return Task.FromResult(emotion != null ? MapToResponse(emotion) : null);
    }

    public async Task<string?> GetEmotionColorAsync(string emotionName)
    {
        _logger.LogInformation("Fetching color for emotion: {EmotionName}", emotionName);
        var emotion = await GetEmotionByNameAsync(emotionName);
        return emotion?.Color;
    }

    private static EmotionResponse MapToResponse(Emotion emotion)
    {
        return new EmotionResponse
        {
            Id = emotion.Id,
            Name = emotion.Name,
            Color = emotion.Color,
            Description = emotion.Description,
            IsActive = emotion.IsActive,
            CreatedAt = emotion.CreatedAt,
            UpdatedAt = emotion.UpdatedAt,
        };
    }
}

