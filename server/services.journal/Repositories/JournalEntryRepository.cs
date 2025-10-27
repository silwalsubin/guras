using Dapper;
using Microsoft.Extensions.Logging;
using services.journal.Domain;
using services.journal.Requests;
using utilities.Persistence.ConnectionFactories;

namespace services.journal.Repositories;

/// <summary>
/// Repository for journal entry data access
/// </summary>
public class JournalEntryRepository : IJournalEntryRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<JournalEntryRepository> _logger;

    public JournalEntryRepository(IDbConnectionFactory connectionFactory, ILogger<JournalEntryRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<JournalEntry> CreateAsync(Guid userId, CreateJournalEntryRequest request, string title, string? mood = null, int? moodScore = null)
    {
        const string sql = @"
            INSERT INTO journal_entries (
                id, user_id, title, content, mood, mood_score, tags, created_at, updated_at, is_deleted
            ) VALUES (
                @Id, @UserId, @Title, @Content, @Mood, @MoodScore, @Tags, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, false
            ) RETURNING *";

        using var connection = await _connectionFactory.GetConnectionAsync();

        var journalEntry = await connection.QuerySingleAsync<JournalEntry>(sql, new
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Title = title,
            request.Content,
            Mood = mood,
            MoodScore = moodScore,
            Tags = request.Tags ?? Array.Empty<string>()
        });

        _logger.LogInformation("Created journal entry with ID: {JournalEntryId} for user: {UserId}", journalEntry.Id, userId);
        return journalEntry;
    }

    public async Task<JournalEntry?> GetByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT
                id as Id,
                user_id as UserId,
                title as Title,
                content as Content,
                mood as Mood,
                mood_score as MoodScore,
                tags as Tags,
                created_at as CreatedAt,
                updated_at as UpdatedAt,
                is_deleted as IsDeleted
            FROM journal_entries
            WHERE id = @Id AND is_deleted = false";

        using var connection = await _connectionFactory.GetConnectionAsync();
        var entry = await connection.QuerySingleOrDefaultAsync<JournalEntry>(sql, new { Id = id });
        return entry;
    }

    public async Task<IEnumerable<JournalEntry>> GetByUserIdAsync(Guid userId, int page = 1, int pageSize = 20)
    {
        const string sql = @"
            SELECT
                id as Id,
                user_id as UserId,
                title as Title,
                content as Content,
                mood as Mood,
                mood_score as MoodScore,
                tags as Tags,
                created_at as CreatedAt,
                updated_at as UpdatedAt,
                is_deleted as IsDeleted
            FROM journal_entries
            WHERE user_id = @UserId AND is_deleted = false
            ORDER BY created_at DESC
            LIMIT @PageSize OFFSET @Offset";

        var offset = (page - 1) * pageSize;

        using var connection = await _connectionFactory.GetConnectionAsync();
        var entries = await connection.QueryAsync<JournalEntry>(sql, new
        {
            UserId = userId,
            PageSize = pageSize,
            Offset = offset
        });

        return entries;
    }

    public async Task<JournalEntry?> UpdateAsync(Guid id, UpdateJournalEntryRequest request, string? mood = null, int? moodScore = null)
    {
        const string sql = @"
            UPDATE journal_entries
            SET
                content = COALESCE(@Content, content),
                mood = COALESCE(@Mood, mood),
                mood_score = COALESCE(@MoodScore, mood_score),
                tags = COALESCE(@Tags, tags),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @Id AND is_deleted = false
            RETURNING *";

        using var connection = await _connectionFactory.GetConnectionAsync();

        var journalEntry = await connection.QuerySingleOrDefaultAsync<JournalEntry>(sql, new
        {
            Id = id,
            request.Content,
            Mood = mood,
            MoodScore = moodScore,
            Tags = request.Tags ?? Array.Empty<string>()
        });

        if (journalEntry != null)
        {
            _logger.LogInformation("Updated journal entry with ID: {JournalEntryId}", id);
        }

        return journalEntry;
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = @"
            UPDATE journal_entries
            SET is_deleted = true, updated_at = CURRENT_TIMESTAMP
            WHERE id = @Id AND is_deleted = false";

        using var connection = await _connectionFactory.GetConnectionAsync();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

        if (rowsAffected > 0)
        {
            _logger.LogInformation("Soft deleted journal entry with ID: {JournalEntryId}", id);
        }

        return rowsAffected > 0;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        const string sql = @"
            SELECT EXISTS(
                SELECT 1 FROM journal_entries
                WHERE id = @Id AND is_deleted = false
            )";

        using var connection = await _connectionFactory.GetConnectionAsync();
        return await connection.ExecuteScalarAsync<bool>(sql, new { Id = id });
    }

    public async Task<int> GetCountByUserIdAsync(Guid userId)
    {
        const string sql = @"
            SELECT COUNT(*)
            FROM journal_entries
            WHERE user_id = @UserId AND is_deleted = false";

        using var connection = await _connectionFactory.GetConnectionAsync();
        return await connection.ExecuteScalarAsync<int>(sql, new { UserId = userId });
    }
}

