using services.journal.Domain;
using services.journal.Requests;

namespace services.journal.Repositories;

/// <summary>
/// Repository interface for journal entry data access
/// </summary>
public interface IJournalEntryRepository
{
    Task<JournalEntry> CreateAsync(Guid userId, CreateJournalEntryRequest request, string title, string? mood = null, int? moodScore = null);
    Task<JournalEntry?> GetByIdAsync(Guid id);
    Task<IEnumerable<JournalEntry>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20, string? search = null);
    Task<JournalEntry?> UpdateAsync(Guid id, UpdateJournalEntryRequest request, string? mood = null, int? moodScore = null);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> GetCountByUserIdAsync(Guid userId);
    Task<bool> SaveEmotionsAsync(Guid journalEntryId, List<string> emotionIds);
    Task<List<EmotionCount>> GetUserEmotionCountsAsync(Guid userId);
}

