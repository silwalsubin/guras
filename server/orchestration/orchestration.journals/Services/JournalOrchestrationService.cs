using Microsoft.Extensions.Logging;
using orchestration.journals.Responses;
using services.emotions.Services;
using services.journal.Requests;
using services.journal.Services;

namespace orchestration.journals.Services;

/// <summary>
/// Orchestration service that coordinates journal and emotion services
/// </summary>
public class JournalOrchestrationService : IJournalOrchestrationService
{
    private readonly IJournalEntryService _journalService;
    private readonly IEmotionService _emotionService;
    private readonly ILogger<JournalOrchestrationService> _logger;

    public JournalOrchestrationService(
        IJournalEntryService journalService,
        IEmotionService emotionService,
        ILogger<JournalOrchestrationService> logger)
    {
        _journalService = journalService;
        _emotionService = emotionService;
        _logger = logger;
    }

    public async Task<JournalEntryWithEmotionsResponse?> GetJournalEntryWithEmotionsAsync(Guid journalEntryId)
    {
        try
        {
            _logger.LogInformation("Getting journal entry with emotions: {JournalEntryId}", journalEntryId);

            var journalEntry = await _journalService.GetByIdAsync(journalEntryId);
            if (journalEntry == null)
            {
                return null;
            }

            return await EnrichJournalEntryWithEmotionsAsync(journalEntry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting journal entry with emotions: {JournalEntryId}", journalEntryId);
            throw;
        }
    }

    public async Task<List<JournalEntryWithEmotionsResponse>> GetUserJournalEntriesWithEmotionsAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Getting user journal entries with emotions: {UserId}", userId);

            var journalEntries = await _journalService.GetByUserIdAsync(userId);

            var enrichedEntries = new List<JournalEntryWithEmotionsResponse>();
            foreach (var entry in journalEntries)
            {
                var enrichedEntry = await EnrichJournalEntryWithEmotionsAsync(entry);
                enrichedEntries.Add(enrichedEntry);
            }

            return enrichedEntries;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting user journal entries with emotions: {UserId}", userId);
            throw;
        }
    }

    public async Task<JournalEntryWithEmotionsResponse> CreateJournalEntryWithEmotionsAsync(
        Guid userId,
        string content,
        List<string>? emotionIds = null,
        string[]? tags = null)
    {
        try
        {
            _logger.LogInformation("Creating journal entry with emotions for user: {UserId}", userId);

            var request = new CreateJournalEntryRequest
            {
                Content = content,
                Tags = tags,
                EmotionIds = emotionIds
            };

            var journalEntry = await _journalService.CreateAsync(userId, request);
            return await EnrichJournalEntryWithEmotionsAsync(journalEntry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating journal entry with emotions for user: {UserId}", userId);
            throw;
        }
    }

    private async Task<JournalEntryWithEmotionsResponse> EnrichJournalEntryWithEmotionsAsync(
        services.journal.Responses.JournalEntryResponse journalEntry)
    {
        var response = new JournalEntryWithEmotionsResponse
        {
            Id = journalEntry.Id,
            UserId = journalEntry.UserId,
            Title = journalEntry.Title,
            Content = journalEntry.Content,
            Mood = journalEntry.Mood,
            MoodScore = journalEntry.MoodScore,
            Tags = journalEntry.Tags,
            CreatedAt = journalEntry.CreatedAt,
            UpdatedAt = journalEntry.UpdatedAt,
            IsDeleted = journalEntry.IsDeleted,
            Emotions = new List<services.emotions.Domain.EmotionResponse>()
        };

        // Fetch emotion data for each emotion ID
        if (journalEntry.EmotionIds != null && journalEntry.EmotionIds.Count > 0)
        {
            foreach (var emotionId in journalEntry.EmotionIds)
            {
                try
                {
                    var emotion = await _emotionService.GetEmotionByIdAsync(emotionId);
                    if (emotion != null)
                    {
                        response.Emotions.Add(emotion);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch emotion data for emotion ID: {EmotionId}", emotionId);
                }
            }
        }

        return response;
    }
}

