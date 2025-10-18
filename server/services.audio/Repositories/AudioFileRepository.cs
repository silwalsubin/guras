using Dapper;
using Microsoft.Extensions.Logging;
using services.audio.Models;
using utilities.Persistence.ConnectionFactories;

namespace services.audio.Repositories;

public class AudioFileRepository : IAudioFileRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<AudioFileRepository> _logger;

    public AudioFileRepository(IDbConnectionFactory connectionFactory, ILogger<AudioFileRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<AudioFile> CreateAsync(CreateAudioFileRequest request, Guid userId, string audioS3Key, string? thumbnailS3Key, Guid? audioFileId = null)
    {
        const string sql = @"
            INSERT INTO audiofiles (
                id, name, author, description, duration_seconds, file_size_bytes,
                audio_s3_key, thumbnail_s3_key, audio_content_type, thumbnail_content_type,
                uploaded_by_user_id, created_at, updated_at
            ) VALUES (
                @Id, @Name, @Author, @Description, @DurationSeconds, @FileSizeBytes,
                @AudioS3Key, @ThumbnailS3Key, @AudioContentType, @ThumbnailContentType,
                @UploadedByUserId, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            ) RETURNING *";

        using var connection = await _connectionFactory.GetConnectionAsync();

        var audioFile = await connection.QuerySingleAsync<AudioFile>(sql, new
        {
            Id = audioFileId ?? Guid.NewGuid(), // Use provided ID or generate new one
            request.Name,
            request.Author,
            request.Description,
            request.DurationSeconds,
            request.FileSizeBytes,
            AudioS3Key = audioS3Key,
            ThumbnailS3Key = thumbnailS3Key,
            request.AudioContentType,
            request.ThumbnailContentType,
            UploadedByUserId = userId
        });

        _logger.LogInformation("Created audio file record with ID: {AudioFileId}", audioFile.Id);
        return audioFile;
    }

    public async Task<AudioFile?> GetByIdAsync(Guid id)
    {
        const string sql = @"
            SELECT
                id as Id,
                name as Name,
                author as Author,
                description as Description,
                duration_seconds as DurationSeconds,
                file_size_bytes as FileSizeBytes,
                audio_s3_key as AudioS3Key,
                thumbnail_s3_key as ThumbnailS3Key,
                audio_content_type as AudioContentType,
                thumbnail_content_type as ThumbnailContentType,
                uploaded_by_user_id as UploadedByUserId,
                created_at as CreatedAt,
                updated_at as UpdatedAt
            FROM audiofiles
            WHERE id = @Id";

        using var connection = await _connectionFactory.GetConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<AudioFile>(sql, new { Id = id });
    }

    public async Task<IEnumerable<AudioFile>> GetByUserIdAsync(Guid userId)
    {
        const string sql = @"
            SELECT
                id as Id,
                name as Name,
                author as Author,
                description as Description,
                duration_seconds as DurationSeconds,
                file_size_bytes as FileSizeBytes,
                audio_s3_key as AudioS3Key,
                thumbnail_s3_key as ThumbnailS3Key,
                audio_content_type as AudioContentType,
                thumbnail_content_type as ThumbnailContentType,
                uploaded_by_user_id as UploadedByUserId,
                created_at as CreatedAt,
                updated_at as UpdatedAt
            FROM audiofiles
            WHERE uploaded_by_user_id = @UserId
            ORDER BY created_at DESC";

        using var connection = await _connectionFactory.GetConnectionAsync();
        return await connection.QueryAsync<AudioFile>(sql, new { UserId = userId });
    }

    public async Task<IEnumerable<AudioFile>> GetAllAsync()
    {
        const string sql = @"
            SELECT
                id as Id,
                name as Name,
                author as Author,
                description as Description,
                duration_seconds as DurationSeconds,
                file_size_bytes as FileSizeBytes,
                audio_s3_key as AudioS3Key,
                thumbnail_s3_key as ThumbnailS3Key,
                audio_content_type as AudioContentType,
                thumbnail_content_type as ThumbnailContentType,
                uploaded_by_user_id as UploadedByUserId,
                created_at as CreatedAt,
                updated_at as UpdatedAt
            FROM audiofiles
            ORDER BY created_at DESC";

        using var connection = await _connectionFactory.GetConnectionAsync();
        return await connection.QueryAsync<AudioFile>(sql);
    }

    public async Task<AudioFile?> UpdateAsync(Guid id, CreateAudioFileRequest request)
    {
        const string sql = @"
            UPDATE audiofiles SET 
                name = @Name,
                author = @Author,
                description = @Description,
                duration_seconds = @DurationSeconds,
                file_size_bytes = @FileSizeBytes,
                audio_content_type = @AudioContentType,
                thumbnail_content_type = @ThumbnailContentType,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @Id
            RETURNING *";

        using var connection = await _connectionFactory.GetConnectionAsync();
        return await connection.QuerySingleOrDefaultAsync<AudioFile>(sql, new
        {
            Id = id,
            request.Name,
            request.Author,
            request.Description,
            request.DurationSeconds,
            request.FileSizeBytes,
            request.AudioContentType,
            request.ThumbnailContentType
        });
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        const string sql = "DELETE FROM audiofiles WHERE id = @Id";

        using var connection = await _connectionFactory.GetConnectionAsync();
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });

        _logger.LogInformation("Deleted audio file record with ID: {AudioFileId}", id);
        return rowsAffected > 0;
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        const string sql = "SELECT COUNT(1) FROM audiofiles WHERE id = @Id";

        using var connection = await _connectionFactory.GetConnectionAsync();
        var count = await connection.QuerySingleAsync<int>(sql, new { Id = id });
        return count > 0;
    }
}
