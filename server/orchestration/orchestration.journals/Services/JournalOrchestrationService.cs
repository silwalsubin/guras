using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using orchestration.journals.Responses;
using services.emotions.Services;
using services.journal.Requests;
using services.journal.Services;
using utilities.ai.Services;

namespace orchestration.journals.Services;

/// <summary>
/// Orchestration service that coordinates journal and emotion services
/// </summary>
public class JournalOrchestrationService : IJournalOrchestrationService
{
    private readonly IJournalEntryService _journalService;
    private readonly IEmotionService _emotionService;
    private readonly ISpiritualAIService _aiService;
    private readonly ILogger<JournalOrchestrationService> _logger;

    public JournalOrchestrationService(
        IJournalEntryService journalService,
        IEmotionService emotionService,
        ISpiritualAIService aiService,
        ILogger<JournalOrchestrationService> logger)
    {
        _journalService = journalService;
        _emotionService = emotionService;
        _aiService = aiService;
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
        string content)
    {
        try
        {
            _logger.LogInformation("Creating journal entry with emotions for user: {UserId}", userId);

            // Create the journal entry without emotions (emotions will be determined by AI)
            var request = new CreateJournalEntryRequest
            {
                Content = content
            };

            var journalEntry = await _journalService.CreateAsync(userId, request);

            // Analyze emotions from the content using AI
            _logger.LogInformation("Analyzing emotions for journal entry {JournalEntryId}", journalEntry.Id);
            var analyzedEmotionIds = await AnalyzeJournalEmotionsAsync(content);

            // Save the analyzed emotions to the database
            if (analyzedEmotionIds.Count > 0)
            {
                _logger.LogInformation("Saving {EmotionCount} analyzed emotions for journal entry {JournalEntryId}", analyzedEmotionIds.Count, journalEntry.Id);
                await SaveEmotionsToEntryAsync(journalEntry.Id, analyzedEmotionIds);
            }
            else
            {
                _logger.LogWarning("No emotions were analyzed for journal entry {JournalEntryId}", journalEntry.Id);
            }

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
            CreatedAt = journalEntry.CreatedAt,
            UpdatedAt = journalEntry.UpdatedAt,
            IsDeleted = journalEntry.IsDeleted,
            Emotions = new List<services.emotions.Domain.EmotionResponse>()
        };

        // Log emotion IDs for debugging
        _logger.LogInformation("Enriching journal entry {JournalEntryId} with {EmotionCount} emotions: {EmotionIds}",
            journalEntry.Id,
            journalEntry.EmotionIds?.Count ?? 0,
            journalEntry.EmotionIds != null ? string.Join(", ", journalEntry.EmotionIds) : "none");

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
                        _logger.LogInformation("Successfully fetched emotion {EmotionId}: {EmotionName}", emotionId, emotion.Name);
                        response.Emotions.Add(emotion);
                    }
                    else
                    {
                        _logger.LogWarning("Emotion not found for ID: {EmotionId}", emotionId);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to fetch emotion data for emotion ID: {EmotionId}", emotionId);
                }
            }
        }

        _logger.LogInformation("Journal entry {JournalEntryId} enriched with {EnrichedEmotionCount} emotions",
            journalEntry.Id,
            response.Emotions.Count);

        return response;
    }

    public async Task<List<string>> AnalyzeJournalEmotionsAsync(string content)
    {
        try
        {
            _logger.LogInformation("Analyzing journal content to determine emotions");

            // Get all available emotions
            var allEmotions = await _emotionService.GetAllEmotionsAsync();
            if (allEmotions == null || !allEmotions.Any())
            {
                _logger.LogWarning("No emotions available for analysis");
                return new List<string>();
            }

            // Create a list of emotion names for the AI prompt
            var emotionNames = allEmotions.Select(e => e.Name).ToList();
            var emotionList = string.Join(", ", emotionNames);

            // Truncate content if too long
            var truncatedContent = content.Length > 1000 ? content.Substring(0, 1000) : content;

            // Create prompt for AI to analyze emotions
            var prompt = $@"Analyze the following journal entry and determine which emotions best describe it.

Available emotions: {emotionList}

Journal Entry:
{truncatedContent}

Based on the content, select the top 2-3 emotions that best describe the emotional state expressed in this journal entry.

IMPORTANT: Respond ONLY with valid JSON (no markdown, no code blocks, no additional text). Use this exact format:
{{
  ""emotions"": [""emotion1"", ""emotion2"", ""emotion3""]
}}

Only include emotions from the available list above. If you cannot determine emotions, return an empty array.";

            // Call AI service to analyze emotions
            var aiResponse = await _aiService.GenerateRecommendationAsync(prompt);

            _logger.LogInformation("AI Response for emotion analysis: {Response}", aiResponse);

            // Parse the AI response to extract emotion IDs
            var emotionIds = new List<string>();
            try
            {
                // Clean up the response - remove markdown code blocks if present
                var cleanedResponse = aiResponse;
                if (cleanedResponse.Contains("```json"))
                {
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"```json\s*", "");
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"\s*```", "");
                }
                else if (cleanedResponse.Contains("```"))
                {
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"```\s*", "");
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"\s*```", "");
                }

                cleanedResponse = cleanedResponse.Trim();

                // Try to parse as JSON
                var parsed = JsonConvert.DeserializeObject<dynamic>(cleanedResponse);

                if (parsed != null && parsed["emotions"] != null)
                {
                    var emotions = parsed["emotions"];
                    foreach (var emotionName in emotions)
                    {
                        var emotionNameStr = emotionName.ToString();
                        // Find the emotion ID by name
                        var emotion = allEmotions.FirstOrDefault(e =>
                            e.Name.Equals(emotionNameStr, StringComparison.OrdinalIgnoreCase));

                        if (emotion != null)
                        {
                            emotionIds.Add(emotion.Id);
                        }
                    }
                }
            }
            catch (Exception parseEx)
            {
                _logger.LogWarning(parseEx, "Failed to parse AI emotion analysis response");
                // Return empty list if parsing fails
            }

            _logger.LogInformation("Successfully analyzed journal emotions. Found {Count} emotions", emotionIds.Count);
            return emotionIds;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing journal emotions");
            throw;
        }
    }

    private async Task SaveEmotionsToEntryAsync(Guid journalEntryId, List<string> emotionIds)
    {
        try
        {
            // This method would need access to the journal entry repository to save emotions
            // For now, this is a placeholder that logs the intent
            // In a real implementation, you would inject IJournalEntryRepository and call a method to save emotions
            _logger.LogInformation("Saving {EmotionCount} emotions to journal entry {JournalEntryId}: {EmotionIds}",
                emotionIds.Count,
                journalEntryId,
                string.Join(", ", emotionIds));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving emotions to journal entry {JournalEntryId}", journalEntryId);
            throw;
        }
    }
}

