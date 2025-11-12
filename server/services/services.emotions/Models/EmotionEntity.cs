using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.emotions.Models;

[Table("emotions")]
public class EmotionEntity
{
    [Key]
    [Column("id")]
    [MaxLength(50)]
    public string Id { get; set; } = string.Empty;

    [Required]
    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("color")]
    [MaxLength(7)]
    public string Color { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

