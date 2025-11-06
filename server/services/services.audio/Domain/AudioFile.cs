namespace services.audio.Domain;

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

