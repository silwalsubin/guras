using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.audio.Data;
using services.audio.Domain;
using services.audio.Models;
using services.audio.Requests;
using services.audio.Services;

namespace services.audio.Repositories;

public class AudioFileRepository : IAudioFileRepository
{
    private readonly AudioFilesDbContext _context;
    private readonly ILogger<AudioFileRepository> _logger;

    public AudioFileRepository(AudioFilesDbContext context, ILogger<AudioFileRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<AudioFile> CreateAsync(CreateAudioFileRequest request, Guid userId, string audioS3Key, string? thumbnailS3Key, Guid? audioFileId = null)
    {
        try
        {
            _logger.LogInformation("Creating audio file: {Name} using Entity Framework", request.Name);

            var audioFile = request.ToDomain(userId, audioS3Key, thumbnailS3Key, audioFileId);
            var entity = audioFile.ToEntity();
            _context.AudioFiles.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created audio file: {Name} with ID: {AudioFileId}",
                request.Name, entity.Id);

            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating audio file: {Name}", request.Name);
            throw;
        }
    }

    public async Task<AudioFile?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving audio file by ID: {AudioFileId} using Entity Framework", id);
            var entity = await _context.AudioFiles
                .FirstOrDefaultAsync(a => a.Id == id);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audio file by ID: {AudioFileId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<AudioFile>> GetByUserIdAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Retrieving audio files by user ID: {UserId} using Entity Framework", userId);
            var entities = await _context.AudioFiles
                .Where(a => a.UploadedByUserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving audio files by user ID: {UserId}", userId);
            throw;
        }
    }

    public async Task<IEnumerable<AudioFile>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all audio files using Entity Framework");
            var entities = await _context.AudioFiles
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all audio files");
            throw;
        }
    }

    public async Task<AudioFile?> UpdateAsync(Guid id, CreateAudioFileRequest request)
    {
        try
        {
            _logger.LogInformation("Updating audio file: {AudioFileId} using Entity Framework", id);

            var entity = await _context.AudioFiles.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning("Audio file not found for update: {AudioFileId}", id);
                return null;
            }

            // Update entity properties
            entity.Name = request.Name;
            entity.Author = request.Author;
            entity.Description = request.Description;
            entity.DurationSeconds = request.DurationSeconds;
            entity.FileSizeBytes = request.FileSizeBytes;
            entity.AudioContentType = request.AudioContentType;
            entity.ThumbnailContentType = request.ThumbnailContentType;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated audio file: {AudioFileId}", id);
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating audio file: {AudioFileId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting audio file: {AudioFileId} using Entity Framework", id);

            var entity = await _context.AudioFiles.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning("Audio file not found for deletion: {AudioFileId}", id);
                return false;
            }

            _context.AudioFiles.Remove(entity);
            var result = await _context.SaveChangesAsync();

            _logger.LogInformation("Audio file deletion result: {Result} for ID: {AudioFileId}", result > 0, id);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting audio file: {AudioFileId}", id);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(Guid id)
    {
        try
        {
            return await _context.AudioFiles.AnyAsync(a => a.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if audio file exists: {AudioFileId}", id);
            throw;
        }
    }
}
