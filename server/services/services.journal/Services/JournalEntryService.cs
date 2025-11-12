using Microsoft.Extensions.Logging;
using services.journal.Domain;
using services.journal.Repositories;
using services.journal.Requests;
using services.journal.Responses;

namespace services.journal.Services;

/// <summary>
/// Service for journal entry operations
/// </summary>
public class JournalEntryService : IJournalEntryService
{
    private readonly IJournalEntryRepository _repository;
    private readonly ILogger<JournalEntryService> _logger;

    public JournalEntryService(
        IJournalEntryRepository repository,
        ILogger<JournalEntryService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<JournalEntryResponse> CreateAsync(Guid userId, CreateJournalEntryRequest request)
    {
        try
        {
            // Validate request
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                throw new ArgumentException("Content is required");
            }

            // Generate title from content
            var title = GenerateTitle(request.Content);

            // Create the journal entry (emotions are handled by orchestration layer)
            var journalEntry = await _repository.CreateAsync(userId, request, title, null, null);

            _logger.LogInformation("Successfully created journal entry with ID: {JournalEntryId}", journalEntry.Id);

            return MapToResponse(journalEntry);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating journal entry for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<JournalEntryResponse?> GetByIdAsync(Guid id)
    {
        try
        {
            var journalEntry = await _repository.GetByIdAsync(id);
            return journalEntry != null ? MapToResponse(journalEntry) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting journal entry: {JournalEntryId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<JournalEntryResponse>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20, string? search = null)
    {
        try
        {
            var journalEntries = await _repository.GetByUserIdAsync(userId, page, pageSize, search);
            return journalEntries.Select(MapToResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting journal entries for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<JournalEntryResponse?> UpdateAsync(Guid id, UpdateJournalEntryRequest request)
    {
        try
        {
            var journalEntry = await _repository.UpdateAsync(id, request);
            return journalEntry != null ? MapToResponse(journalEntry) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating journal entry: {JournalEntryId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            var success = await _repository.DeleteAsync(id);
            if (success)
            {
                _logger.LogInformation("Successfully deleted journal entry: {JournalEntryId}", id);
            }
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting journal entry: {JournalEntryId}", id);
            throw;
        }
    }

    public async Task<bool> SaveEmotionsAsync(Guid journalEntryId, List<string> emotionIds)
    {
        try
        {
            _logger.LogInformation("Saving {EmotionCount} emotions for journal entry {JournalEntryId}", emotionIds.Count, journalEntryId);
            var success = await _repository.SaveEmotionsAsync(journalEntryId, emotionIds);
            if (success)
            {
                _logger.LogInformation("Successfully saved emotions for journal entry: {JournalEntryId}", journalEntryId);
            }
            return success;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving emotions for journal entry: {JournalEntryId}", journalEntryId);
            throw;
        }
    }

    public async Task<List<EmotionCount>> GetUserEmotionCountsAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Getting emotion counts for user: {UserId}", userId);
            var emotionCounts = await _repository.GetUserEmotionCountsAsync(userId);
            _logger.LogInformation("Retrieved {EmotionCountCount} emotion counts for user: {UserId}", emotionCounts.Count, userId);
            return emotionCounts;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting emotion counts for user: {UserId}", userId);
            throw;
        }
    }

    private static string GenerateTitle(string content)
    {
        // Use first 50 characters of content as title
        return content.Length > 50 ? content.Substring(0, 50) + "..." : content;
    }

    private static JournalEntryResponse MapToResponse(JournalEntry entry)
    {
        return new JournalEntryResponse
        {
            Id = entry.Id,
            UserId = entry.UserId,
            Title = entry.Title,
            Content = entry.Content,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt,
            IsDeleted = entry.IsDeleted,
            EmotionIds = entry.Emotions?.Select(e => e.EmotionId).ToList() ?? new List<string>()
        };
    }
}

