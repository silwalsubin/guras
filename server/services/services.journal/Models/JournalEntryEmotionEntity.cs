using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.journal.Models;

[Table("journal_entry_emotions")]
public class JournalEntryEmotionEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("journal_entry_id")]
    public Guid JournalEntryId { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("emotion_id")]
    public string EmotionId { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    // Navigation property
    [ForeignKey("JournalEntryId")]
    public JournalEntryEntity? JournalEntry { get; set; }
}

