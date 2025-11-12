using orchestration.journals.Responses;
using services.journal.Responses;

namespace orchestration.journals.Services;

/// <summary>
/// Orchestration service that coordinates journal and emotion services
/// </summary>
public interface IJournalOrchestrationService
{
    /// <summary>
    /// Get a journal entry with enriched emotion data
    /// </summary>
    Task<JournalEntryWithEmotionsResponse?> GetJournalEntryWithEmotionsAsync(Guid journalEntryId);

    /// <summary>
    /// Get all journal entries for a user with enriched emotion data
    /// </summary>
    Task<List<JournalEntryWithEmotionsResponse>> GetUserJournalEntriesWithEmotionsAsync(Guid userId);

    /// <summary>
    /// Create a journal entry with associated emotions
    /// </summary>
    Task<JournalEntryWithEmotionsResponse> CreateJournalEntryWithEmotionsAsync(
        Guid userId,
        string content,
        List<string>? emotionIds = null,
        string[]? tags = null);

    /// <summary>
    /// Analyze journal content and determine which emotions best describe it using AI
    /// </summary>
    Task<List<string>> AnalyzeJournalEmotionsAsync(string content);
}

