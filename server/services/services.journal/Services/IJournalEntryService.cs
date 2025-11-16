using services.journal.Domain;
using services.journal.Requests;
using services.journal.Responses;

namespace services.journal.Services;

/// <summary>
/// Service interface for journal entry operations
/// </summary>
public interface IJournalEntryService
{
    Task<JournalEntryResponse> CreateAsync(Guid userId, CreateJournalEntryRequest request);
    Task<JournalEntryResponse?> GetByIdAsync(Guid id);
    Task<IEnumerable<JournalEntryResponse>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20, string? search = null);
    Task<JournalEntryResponse?> UpdateAsync(Guid id, UpdateJournalEntryRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> SaveEmotionsAsync(Guid journalEntryId, List<string> emotionIds);
    Task<List<EmotionCount>> GetUserEmotionCountsAsync(Guid userId);
    Task<List<EmotionCount>> GetUserEmotionCountsAsync(Guid userId, DateTime startDate, DateTime endDate);
}

