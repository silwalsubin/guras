using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.quotes.Models;

[Table("quotes")]
public class QuoteEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("text")]
    public string Text { get; set; } = string.Empty;

    [Required]
    [MaxLength(255)]
    [Column("author")]
    public string Author { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    [Column("category")]
    public string Category { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

