using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.journal.Data;
using services.journal.Domain;
using services.journal.Models;
using services.journal.Requests;
using services.journal.Services;

namespace services.journal.Repositories;

/// <summary>
/// Repository for journal entry data access
/// </summary>
public class JournalEntryRepository : IJournalEntryRepository
{
    private readonly JournalEntriesDbContext _context;
    private readonly ILogger<JournalEntryRepository> _logger;

    public JournalEntryRepository(JournalEntriesDbContext context, ILogger<JournalEntryRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<JournalEntry> CreateAsync(Guid userId, CreateJournalEntryRequest request, string title, string? mood = null, int? moodScore = null)
    {
        try
        {
            _logger.LogInformation("Creating journal entry for user: {UserId} using Entity Framework", userId);

            var journalEntry = request.ToDomain(userId, title, mood, moodScore);
            var entity = journalEntry.ToEntity();
            _context.JournalEntries.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created journal entry with ID: {JournalEntryId} for user: {UserId}", journalEntry.Id, userId);
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating journal entry for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<JournalEntry?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving journal entry by ID: {JournalEntryId} using Entity Framework", id);
            var entity = await _context.JournalEntries
                .Include(e => e.Emotions)
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving journal entry by ID: {JournalEntryId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<JournalEntry>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20, string? search = null)
    {
        try
        {
            _logger.LogInformation("Retrieving journal entries for user: {UserId} using Entity Framework", userId);

            var query = _context.JournalEntries
                .Include(e => e.Emotions)
                .Where(e => e.UserId == userId && !e.IsDeleted);

            // Add search filter if provided
            if (!string.IsNullOrWhiteSpace(search))
            {
                var searchLower = search.ToLower();
                query = query.Where(e =>
                    e.Title.ToLower().Contains(searchLower) ||
                    e.Content.ToLower().Contains(searchLower));
            }

            var offset = (page - 1) * pageSize;
            var entities = await query
                .OrderByDescending(e => e.CreatedAt)
                .Skip(offset)
                .Take(pageSize)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving journal entries for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<JournalEntry?> UpdateAsync(Guid id, UpdateJournalEntryRequest request, string? mood = null, int? moodScore = null)
    {
        try
        {
            _logger.LogInformation("Updating journal entry: {JournalEntryId} using Entity Framework", id);

            var entity = await _context.JournalEntries
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (entity == null)
            {
                _logger.LogWarning("Journal entry not found for update: {JournalEntryId}", id);
                return null;
            }

            // Update entity properties
            if (request.Title != null)
                entity.Title = request.Title;
            if (request.Content != null)
                entity.Content = request.Content;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated journal entry with ID: {JournalEntryId}", id);
            return entity.ToDomain();
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
            _logger.LogInformation("Soft deleting journal entry: {JournalEntryId} using Entity Framework", id);

            var entity = await _context.JournalEntries
                .FirstOrDefaultAsync(e => e.Id == id && !e.IsDeleted);

            if (entity == null)
            {
                _logger.LogWarning("Journal entry not found for deletion: {JournalEntryId}", id);
                return false;
            }

            entity.IsDeleted = true;
            entity.UpdatedAt = DateTime.UtcNow;
            var result = await _context.SaveChangesAsync();

            _logger.LogInformation("Soft deleted journal entry with ID: {JournalEntryId}", id);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting journal entry: {JournalEntryId}", id);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        try
        {
            return await _context.JournalEntries
                .AnyAsync(e => e.Id == id && !e.IsDeleted);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if journal entry exists: {JournalEntryId}", id);
            throw;
        }
    }

    public async Task<int> GetCountByUserIdAsync(Guid userId)
    {
        try
        {
            return await _context.JournalEntries
                .CountAsync(e => e.UserId == userId && !e.IsDeleted);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting journal entry count for user: {UserId}", userId);
            throw;
        }
    }
}

