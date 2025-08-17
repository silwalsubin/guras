using Microsoft.Extensions.Logging;
using services.audio.Models;
using services.audio.Repositories;
using utilities.aws.Utilities;

namespace services.audio.Services;

public class AudioFileService : IAudioFileService
{
    private readonly IAudioFileRepository _audioFileRepository;
    private readonly AudioFilesUtility _audioFilesUtility;
    private readonly ILogger<AudioFileService> _logger;

    public AudioFileService(
        IAudioFileRepository audioFileRepository,
        AudioFilesUtility audioFilesUtility,
        ILogger<AudioFileService> logger)
    {
        _audioFileRepository = audioFileRepository;
        _audioFilesUtility = audioFilesUtility;
        _logger = logger;
    }

    public async Task<AudioFileResponse> UploadAudioAsync(FileUpload audioFile, FileUpload thumbnailFile, CreateAudioFileRequest metadata, Guid userId)
    {
        // Generate unique ID for this audio file
        var audioFileId = Guid.NewGuid();

        // Generate S3 keys based on the unique ID
        var audioExtension = Path.GetExtension(audioFile.FileName);
        var audioS3Key = $"{audioFileId}-audio{audioExtension}";

        var thumbnailExtension = Path.GetExtension(thumbnailFile.FileName);
        var thumbnailS3Key = $"{audioFileId}-thumbnail{thumbnailExtension}";

        try
        {
            // Upload audio file to S3
            await _audioFilesUtility.UploadFileAsync(audioS3Key, audioFile.Stream, audioFile.ContentType);

            // Upload thumbnail file to S3
            await _audioFilesUtility.UploadFileAsync(thumbnailS3Key, thumbnailFile.Stream, thumbnailFile.ContentType);

            // Create the database record
            var createRequest = new CreateAudioFileRequest
            {
                Name = metadata.Name,
                Author = metadata.Author,
                Description = metadata.Description,
                DurationSeconds = metadata.DurationSeconds,
                FileSizeBytes = audioFile.Length,
                AudioFileName = audioFile.FileName,
                ThumbnailFileName = thumbnailFile.FileName,
                AudioContentType = audioFile.ContentType,
                ThumbnailContentType = thumbnailFile.ContentType
            };

            var audioFileRecord = await _audioFileRepository.CreateAsync(createRequest, userId, audioS3Key, thumbnailS3Key, audioFileId);

            _logger.LogInformation("Successfully uploaded audio file with ID: {AudioFileId}", audioFileRecord.Id);

            // Return the response with download URLs
            return await MapToResponseAsync(audioFileRecord, 60);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to upload audio file: {AudioFileName}", audioFile.FileName);

            // Clean up S3 files if they were uploaded
            try
            {
                await _audioFilesUtility.DeleteFileAsync(audioS3Key);
                await _audioFilesUtility.DeleteFileAsync(thumbnailS3Key);
            }
            catch (Exception cleanupEx)
            {
                _logger.LogWarning(cleanupEx, "Failed to clean up S3 files after upload failure");
            }

            throw;
        }
    }

    public async Task<GetUploadUrlsResponse> GetUploadUrlsAsync(GetUploadUrlsRequest request, Guid userId)
    {
        // Generate unique ID for this audio file
        var audioFileId = Guid.NewGuid();
        
        // Generate S3 keys based on the unique ID
        var audioExtension = Path.GetExtension(request.AudioFileName);
        var audioS3Key = $"{audioFileId}-audio{audioExtension}";
        
        string? thumbnailS3Key = null;
        if (!string.IsNullOrWhiteSpace(request.ThumbnailFileName))
        {
            var thumbnailExtension = Path.GetExtension(request.ThumbnailFileName);
            thumbnailS3Key = $"{audioFileId}-thumbnail{thumbnailExtension}";
        }

        var expiration = TimeSpan.FromMinutes(request.ExpirationMinutes ?? 15);

        // Generate pre-signed upload URLs
        var audioUploadUrl = await _audioFilesUtility.GeneratePreSignedUploadUrlAsync(audioS3Key, expiration);
        
        string? thumbnailUploadUrl = null;
        if (thumbnailS3Key != null)
        {
            thumbnailUploadUrl = await _audioFilesUtility.GeneratePreSignedUploadUrlAsync(thumbnailS3Key, expiration);
        }

        // Create the database record
        var createRequest = new CreateAudioFileRequest
        {
            Name = request.Name,
            Author = request.Author,
            Description = request.Description,
            DurationSeconds = request.DurationSeconds,
            FileSizeBytes = request.FileSizeBytes,
            AudioFileName = request.AudioFileName,
            ThumbnailFileName = request.ThumbnailFileName,
            AudioContentType = request.AudioContentType,
            ThumbnailContentType = request.ThumbnailContentType
        };

        await _audioFileRepository.CreateAsync(createRequest, userId, audioS3Key, thumbnailS3Key, audioFileId);

        _logger.LogInformation("Generated upload URLs for audio file ID: {AudioFileId}", audioFileId);

        return new GetUploadUrlsResponse
        {
            AudioFileId = audioFileId,
            AudioUploadUrl = audioUploadUrl,
            ThumbnailUploadUrl = thumbnailUploadUrl,
            AudioS3Key = audioS3Key,
            ThumbnailS3Key = thumbnailS3Key,
            ExpiresAt = DateTime.UtcNow.Add(expiration)
        };
    }

    public async Task<AudioFileResponse?> GetByIdAsync(Guid id, int expirationMinutes = 60)
    {
        var audioFile = await _audioFileRepository.GetByIdAsync(id);
        if (audioFile == null) return null;

        return await MapToResponseAsync(audioFile, expirationMinutes);
    }

    public async Task<IEnumerable<AudioFileResponse>> GetByUserIdAsync(Guid userId, int expirationMinutes = 60)
    {
        var audioFiles = await _audioFileRepository.GetByUserIdAsync(userId);
        var responses = new List<AudioFileResponse>();

        foreach (var audioFile in audioFiles)
        {
            var response = await MapToResponseAsync(audioFile, expirationMinutes);
            responses.Add(response);
        }

        return responses;
    }

    public async Task<IEnumerable<AudioFileResponse>> GetAllAsync(int expirationMinutes = 60)
    {
        var audioFiles = await _audioFileRepository.GetAllAsync();
        var responses = new List<AudioFileResponse>();

        foreach (var audioFile in audioFiles)
        {
            var response = await MapToResponseAsync(audioFile, expirationMinutes);
            responses.Add(response);
        }

        return responses;
    }

    public async Task<AudioFileResponse?> UpdateAsync(Guid id, CreateAudioFileRequest request, int expirationMinutes = 60)
    {
        var updatedAudioFile = await _audioFileRepository.UpdateAsync(id, request);
        if (updatedAudioFile == null) return null;

        return await MapToResponseAsync(updatedAudioFile, expirationMinutes);
    }

    public async Task<bool> DeleteAsync(Guid id)
    {
        // Get the audio file to get S3 keys for cleanup
        var audioFile = await _audioFileRepository.GetByIdAsync(id);
        if (audioFile == null) return false;

        // Delete from database first
        var deleted = await _audioFileRepository.DeleteAsync(id);
        if (!deleted) return false;

        // Clean up S3 files (best effort - don't fail if S3 cleanup fails)
        try
        {
            await _audioFilesUtility.DeleteFileAsync(audioFile.AudioS3Key);
            if (!string.IsNullOrWhiteSpace(audioFile.ThumbnailS3Key))
            {
                await _audioFilesUtility.DeleteFileAsync(audioFile.ThumbnailS3Key);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to delete S3 files for audio file ID: {AudioFileId}", id);
        }

        return true;
    }

    private async Task<AudioFileResponse> MapToResponseAsync(AudioFile audioFile, int expirationMinutes)
    {
        var expiration = TimeSpan.FromMinutes(expirationMinutes);

        Console.WriteLine($"🔍 MapToResponseAsync: AudioFile.Id={audioFile.Id}, AudioS3Key='{audioFile.AudioS3Key}', ThumbnailS3Key='{audioFile.ThumbnailS3Key}'");

        // Check if AudioS3Key is empty and log it
        if (string.IsNullOrWhiteSpace(audioFile.AudioS3Key))
        {
            Console.WriteLine($"❌ ERROR: AudioS3Key is empty for AudioFile.Id={audioFile.Id}");
        }

        var audioDownloadUrl = await _audioFilesUtility.GeneratePreSignedDownloadUrlAsync(audioFile.AudioS3Key, expiration);

        string? thumbnailDownloadUrl = null;
        if (!string.IsNullOrWhiteSpace(audioFile.ThumbnailS3Key))
        {
            thumbnailDownloadUrl = await _audioFilesUtility.GeneratePreSignedDownloadUrlAsync(audioFile.ThumbnailS3Key, expiration);
        }

        return new AudioFileResponse
        {
            Id = audioFile.Id,
            Name = audioFile.Name,
            Author = audioFile.Author,
            Description = audioFile.Description,
            DurationSeconds = audioFile.DurationSeconds,
            FileSizeBytes = audioFile.FileSizeBytes,
            AudioDownloadUrl = audioDownloadUrl,
            ThumbnailDownloadUrl = thumbnailDownloadUrl,
            UploadedByUserId = audioFile.UploadedByUserId,
            CreatedAt = audioFile.CreatedAt,
            UpdatedAt = audioFile.UpdatedAt
        };
    }
}
