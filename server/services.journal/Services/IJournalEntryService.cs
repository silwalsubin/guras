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
    Task<IEnumerable<JournalEntryResponse>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20);
    Task<JournalEntryResponse?> UpdateAsync(Guid id, UpdateJournalEntryRequest request);
    Task<bool> DeleteAsync(Guid id);
}

