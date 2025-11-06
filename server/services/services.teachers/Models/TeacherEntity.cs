using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.teachers.Models;

[Table("teachers")]
public class TeacherEntity
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
    [Column("display_name")]
    public string DisplayName { get; set; } = string.Empty;

    [MaxLength(255)]
    [Column("full_name")]
    public string? FullName { get; set; }

    [Column("birth_year")]
    public int? BirthYear { get; set; }

    [Column("death_year")]
    public int? DeathYear { get; set; }

    [MaxLength(100)]
    [Column("nationality")]
    public string? Nationality { get; set; }

    [Column("description")]
    public string? Description { get; set; }

    [MaxLength(255)]
    [Column("tradition_name")]
    public string? TraditionName { get; set; }

    [Column("tradition_description")]
    public string? TraditionDescription { get; set; }

    [MaxLength(100)]
    [Column("tradition_origin")]
    public string? TraditionOrigin { get; set; }

    [MaxLength(50)]
    [Column("era")]
    public string? Era { get; set; }

    [Column("avatar_url")]
    public string? AvatarUrl { get; set; }

    [Column("background_url")]
    public string? BackgroundUrl { get; set; }

    [Column("core_teachings")]
    public List<string> CoreTeachings { get; set; } = new();

    [MaxLength(50)]
    [Column("teaching_approach")]
    public string? TeachingApproach { get; set; }

    [MaxLength(50)]
    [Column("teaching_tone")]
    public string? TeachingTone { get; set; }

    [MaxLength(100)]
    [Column("teaching_focus")]
    public string? TeachingFocus { get; set; }

    [MaxLength(20)]
    [Column("teaching_complexity")]
    public string? TeachingComplexity { get; set; }

    [Column("personality_traits")]
    public List<string> PersonalityTraits { get; set; } = new();

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}
