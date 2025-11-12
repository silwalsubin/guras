using services.emotions.Domain;
using services.emotions.Repositories;
using Microsoft.Extensions.Logging;

namespace services.emotions.Services;

public class EmotionService : IEmotionService
{
    private readonly IEmotionRepository _repository;
    private readonly ILogger<EmotionService> _logger;

    public EmotionService(IEmotionRepository repository, ILogger<EmotionService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<List<EmotionResponse>> GetAllEmotionsAsync()
    {
        _logger.LogInformation("Fetching all emotions from database");
        var emotions = await _repository.GetAllAsync();
        var responses = emotions.Select(MapToResponse).ToList();
        return responses;
    }

    public async Task<EmotionResponse?> GetEmotionByIdAsync(string id)
    {
        _logger.LogInformation("Fetching emotion by ID: {EmotionId}", id);
        var emotion = await _repository.GetByIdAsync(id);
        return emotion != null ? MapToResponse(emotion) : null;
    }

    public async Task<EmotionResponse?> GetEmotionByNameAsync(string name)
    {
        _logger.LogInformation("Fetching emotion by name: {EmotionName}", name);
        var emotion = await _repository.GetByNameAsync(name);
        return emotion != null ? MapToResponse(emotion) : null;
    }

    public async Task<string?> GetEmotionColorAsync(string emotionName)
    {
        _logger.LogInformation("Fetching color for emotion: {EmotionName}", emotionName);
        var emotion = await GetEmotionByNameAsync(emotionName);
        return emotion?.Color;
    }

    public async Task<List<EmotionResponse>> GetEmotionsByIdsAsync(List<string> ids)
    {
        _logger.LogInformation("Fetching emotions by IDs: {EmotionIds}", string.Join(", ", ids));
        var emotions = await _repository.GetByIdsAsync(ids);
        var responses = emotions.Select(MapToResponse).ToList();
        return responses;
    }

    private static EmotionResponse MapToResponse(Emotion emotion)
    {
        return new EmotionResponse
        {
            Id = emotion.Id,
            Name = emotion.Name,
            Color = emotion.Color,
            IsActive = emotion.IsActive,
            CreatedAt = emotion.CreatedAt,
            UpdatedAt = emotion.UpdatedAt,
        };
    }
}

