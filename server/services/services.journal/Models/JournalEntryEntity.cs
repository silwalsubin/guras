using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.journal.Models;

[Table("journal_entries")]
public class JournalEntryEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("title")]
    public string Title { get; set; } = string.Empty;

    [Required]
    [Column("content")]
    public string Content { get; set; } = string.Empty;

    [MaxLength(50)]
    [Column("mood")]
    public string? Mood { get; set; }

    [Column("mood_score")]
    public int? MoodScore { get; set; }

    [Column("tags")]
    public string[]? Tags { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }

    [Column("is_deleted")]
    public bool IsDeleted { get; set; }
}

