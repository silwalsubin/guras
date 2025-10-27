using Microsoft.Extensions.Logging;
using services.journal.Domain;
using services.journal.Repositories;
using services.journal.Requests;
using services.journal.Responses;
using services.ai.Services;

namespace services.journal.Services;

/// <summary>
/// Service for journal entry operations
/// </summary>
public class JournalEntryService : IJournalEntryService
{
    private readonly IJournalEntryRepository _repository;
    private readonly ISpiritualAIService _aiService;
    private readonly ILogger<JournalEntryService> _logger;

    public JournalEntryService(
        IJournalEntryRepository repository,
        ISpiritualAIService aiService,
        ILogger<JournalEntryService> logger)
    {
        _repository = repository;
        _aiService = aiService;
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

            // Generate AI title from content
            var title = await GenerateTitleAsync(request.Content);

            // Create the journal entry
            var journalEntry = await _repository.CreateAsync(userId, request, title);

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

    private async Task<string> GenerateTitleAsync(string content)
    {
        try
        {
            // Use AI service to generate a short title from the content
            var title = await _aiService.GenerateJournalTitleAsync(content);
            return title;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to generate AI title, using default");
            // Fallback: use first 50 characters of content as title
            return content.Length > 50 ? content.Substring(0, 50) + "..." : content;
        }
    }

    private static JournalEntryResponse MapToResponse(JournalEntry entry)
    {
        return new JournalEntryResponse
        {
            Id = entry.Id,
            UserId = entry.UserId,
            Title = entry.Title,
            Content = entry.Content,
            Mood = entry.Mood,
            MoodScore = entry.MoodScore,
            Tags = entry.Tags,
            CreatedAt = entry.CreatedAt,
            UpdatedAt = entry.UpdatedAt,
            IsDeleted = entry.IsDeleted
        };
    }
}

