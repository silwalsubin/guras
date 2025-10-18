using System.ComponentModel.DataAnnotations;

namespace services.teachers.Requests;

public class CreateTeacherRequest
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(255, ErrorMessage = "Name cannot exceed 255 characters")]
    public string Name { get; set; } = string.Empty;

    [Required(ErrorMessage = "Display name is required")]
    [StringLength(255, ErrorMessage = "Display name cannot exceed 255 characters")]
    public string DisplayName { get; set; } = string.Empty;

    [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters")]
    public string? FullName { get; set; }

    [Range(1, 3000, ErrorMessage = "Birth year must be between 1 and 3000")]
    public int? BirthYear { get; set; }

    [Range(1, 3000, ErrorMessage = "Death year must be between 1 and 3000")]
    public int? DeathYear { get; set; }

    [StringLength(100, ErrorMessage = "Nationality cannot exceed 100 characters")]
    public string? Nationality { get; set; }

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string? Description { get; set; }

    [StringLength(255, ErrorMessage = "Tradition name cannot exceed 255 characters")]
    public string? TraditionName { get; set; }

    [StringLength(1000, ErrorMessage = "Tradition description cannot exceed 1000 characters")]
    public string? TraditionDescription { get; set; }

    [StringLength(100, ErrorMessage = "Tradition origin cannot exceed 100 characters")]
    public string? TraditionOrigin { get; set; }

    [StringLength(50, ErrorMessage = "Era cannot exceed 50 characters")]
    public string? Era { get; set; }

    [Url(ErrorMessage = "Avatar URL must be a valid URL")]
    public string? AvatarUrl { get; set; }

    [Url(ErrorMessage = "Background URL must be a valid URL")]
    public string? BackgroundUrl { get; set; }

    public List<string> CoreTeachings { get; set; } = new();

    [StringLength(50, ErrorMessage = "Teaching approach cannot exceed 50 characters")]
    public string? TeachingApproach { get; set; }

    [StringLength(50, ErrorMessage = "Teaching tone cannot exceed 50 characters")]
    public string? TeachingTone { get; set; }

    [StringLength(100, ErrorMessage = "Teaching focus cannot exceed 100 characters")]
    public string? TeachingFocus { get; set; }

    [StringLength(20, ErrorMessage = "Teaching complexity cannot exceed 20 characters")]
    public string? TeachingComplexity { get; set; }

    public List<string> PersonalityTraits { get; set; } = new();
}

public class UpdateTeacherRequest
{
    [StringLength(255, ErrorMessage = "Display name cannot exceed 255 characters")]
    public string? DisplayName { get; set; }

    [StringLength(255, ErrorMessage = "Full name cannot exceed 255 characters")]
    public string? FullName { get; set; }

    [Range(1, 3000, ErrorMessage = "Birth year must be between 1 and 3000")]
    public int? BirthYear { get; set; }

    [Range(1, 3000, ErrorMessage = "Death year must be between 1 and 3000")]
    public int? DeathYear { get; set; }

    [StringLength(100, ErrorMessage = "Nationality cannot exceed 100 characters")]
    public string? Nationality { get; set; }

    [StringLength(2000, ErrorMessage = "Description cannot exceed 2000 characters")]
    public string? Description { get; set; }

    [StringLength(255, ErrorMessage = "Tradition name cannot exceed 255 characters")]
    public string? TraditionName { get; set; }

    [StringLength(1000, ErrorMessage = "Tradition description cannot exceed 1000 characters")]
    public string? TraditionDescription { get; set; }

    [StringLength(100, ErrorMessage = "Tradition origin cannot exceed 100 characters")]
    public string? TraditionOrigin { get; set; }

    [StringLength(50, ErrorMessage = "Era cannot exceed 50 characters")]
    public string? Era { get; set; }

    [Url(ErrorMessage = "Avatar URL must be a valid URL")]
    public string? AvatarUrl { get; set; }

    [Url(ErrorMessage = "Background URL must be a valid URL")]
    public string? BackgroundUrl { get; set; }

    public List<string>? CoreTeachings { get; set; }

    [StringLength(50, ErrorMessage = "Teaching approach cannot exceed 50 characters")]
    public string? TeachingApproach { get; set; }

    [StringLength(50, ErrorMessage = "Teaching tone cannot exceed 50 characters")]
    public string? TeachingTone { get; set; }

    [StringLength(100, ErrorMessage = "Teaching focus cannot exceed 100 characters")]
    public string? TeachingFocus { get; set; }

    [StringLength(20, ErrorMessage = "Teaching complexity cannot exceed 20 characters")]
    public string? TeachingComplexity { get; set; }

    public List<string>? PersonalityTraits { get; set; }

    public bool? IsActive { get; set; }
}
