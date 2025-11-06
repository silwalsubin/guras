using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.audio.Models;

[Table("audiofiles")]
public class AudioFileEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("author")]
    public string Author { get; set; } = string.Empty;

    [Column("description")]
    public string? Description { get; set; }

    [Column("duration_seconds")]
    public int? DurationSeconds { get; set; }

    [Column("file_size_bytes")]
    public long? FileSizeBytes { get; set; }

    [Required]
    [MaxLength(500)]
    [Column("audio_s3_key")]
    public string AudioS3Key { get; set; } = string.Empty;

    [MaxLength(500)]
    [Column("thumbnail_s3_key")]
    public string? ThumbnailS3Key { get; set; }

    [MaxLength(100)]
    [Column("audio_content_type")]
    public string? AudioContentType { get; set; }

    [MaxLength(100)]
    [Column("thumbnail_content_type")]
    public string? ThumbnailContentType { get; set; }

    [Required]
    [Column("uploaded_by_user_id")]
    public Guid UploadedByUserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

