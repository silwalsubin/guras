namespace services.audio.Models;

public class AudioFile
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationSeconds { get; set; }
    public long? FileSizeBytes { get; set; }
    public string AudioS3Key { get; set; } = string.Empty;
    public string? ThumbnailS3Key { get; set; }
    public string? AudioContentType { get; set; }
    public string? ThumbnailContentType { get; set; }
    public Guid UploadedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateAudioFileRequest
{
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationSeconds { get; set; }
    public long? FileSizeBytes { get; set; }
    public string AudioFileName { get; set; } = string.Empty;
    public string? ThumbnailFileName { get; set; }
    public string? AudioContentType { get; set; }
    public string? ThumbnailContentType { get; set; }
}

public class AudioFileResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationSeconds { get; set; }
    public long? FileSizeBytes { get; set; }
    public string AudioDownloadUrl { get; set; } = string.Empty;
    public string? ThumbnailDownloadUrl { get; set; }
    public Guid UploadedByUserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class GetUploadUrlsRequest
{
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public int? DurationSeconds { get; set; }
    public long? FileSizeBytes { get; set; }
    public string AudioFileName { get; set; } = string.Empty;
    public string? ThumbnailFileName { get; set; }
    public string? AudioContentType { get; set; }
    public string? ThumbnailContentType { get; set; }
    public int? ExpirationMinutes { get; set; }
}

public class GetUploadUrlsResponse
{
    public Guid AudioFileId { get; set; }
    public string AudioUploadUrl { get; set; } = string.Empty;
    public string? ThumbnailUploadUrl { get; set; }
    public string AudioS3Key { get; set; } = string.Empty;
    public string? ThumbnailS3Key { get; set; }
    public DateTime ExpiresAt { get; set; }
}
