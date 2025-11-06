using services.audio.Domain;
using services.audio.Models;
using services.audio.Requests;

namespace services.audio.Services;

public static class AudioFileMappingService
{
    public static AudioFileEntity ToEntity(this AudioFile audioFile)
    {
        return new AudioFileEntity
        {
            Id = audioFile.Id,
            Name = audioFile.Name,
            Author = audioFile.Author,
            Description = audioFile.Description,
            DurationSeconds = audioFile.DurationSeconds,
            FileSizeBytes = audioFile.FileSizeBytes,
            AudioS3Key = audioFile.AudioS3Key,
            ThumbnailS3Key = audioFile.ThumbnailS3Key,
            AudioContentType = audioFile.AudioContentType,
            ThumbnailContentType = audioFile.ThumbnailContentType,
            UploadedByUserId = audioFile.UploadedByUserId,
            CreatedAt = audioFile.CreatedAt,
            UpdatedAt = audioFile.UpdatedAt
        };
    }

    public static AudioFile ToDomain(this AudioFileEntity entity)
    {
        return new AudioFile
        {
            Id = entity.Id,
            Name = entity.Name,
            Author = entity.Author,
            Description = entity.Description,
            DurationSeconds = entity.DurationSeconds,
            FileSizeBytes = entity.FileSizeBytes,
            AudioS3Key = entity.AudioS3Key,
            ThumbnailS3Key = entity.ThumbnailS3Key,
            AudioContentType = entity.AudioContentType,
            ThumbnailContentType = entity.ThumbnailContentType,
            UploadedByUserId = entity.UploadedByUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static AudioFile ToDomain(this CreateAudioFileRequest request, Guid userId, string audioS3Key, string? thumbnailS3Key, Guid? audioFileId = null)
    {
        return new AudioFile
        {
            Id = audioFileId ?? Guid.NewGuid(),
            Name = request.Name,
            Author = request.Author,
            Description = request.Description,
            DurationSeconds = request.DurationSeconds,
            FileSizeBytes = request.FileSizeBytes,
            AudioS3Key = audioS3Key,
            ThumbnailS3Key = thumbnailS3Key,
            AudioContentType = request.AudioContentType,
            ThumbnailContentType = request.ThumbnailContentType,
            UploadedByUserId = userId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}

