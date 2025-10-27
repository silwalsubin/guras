using services.journal.Domain;
using services.journal.Requests;

namespace services.journal.Repositories;

/// <summary>
/// Repository interface for journal entry data access
/// </summary>
public interface IJournalEntryRepository
{
    Task<JournalEntry> CreateAsync(Guid userId, CreateJournalEntryRequest request, string title);
    Task<JournalEntry?> GetByIdAsync(Guid id);
    Task<IEnumerable<JournalEntry>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<JournalEntry?> UpdateAsync(Guid id, UpdateJournalEntryRequest request);
    Task<bool> DeleteAsync(Guid id);
    Task<bool> ExistsAsync(Guid id);
    Task<int> GetCountByUserIdAsync(Guid userId);
}

