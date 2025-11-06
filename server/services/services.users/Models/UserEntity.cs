using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.users.Models;

[Table("users")]
public class UserEntity
{
    [Key]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [MaxLength(255)]
    [Column("name")]
    public string? Name { get; set; }

    [MaxLength(255)]
    [Column("firebase_user_id")]
    public string? FireBaseUserId { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

