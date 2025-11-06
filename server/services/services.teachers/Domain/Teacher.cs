namespace services.teachers.Domain;

public class Teacher
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
    public string? Nationality { get; set; }
    public string? Description { get; set; }
    public string? TraditionName { get; set; }
    public string? TraditionDescription { get; set; }
    public string? TraditionOrigin { get; set; }
    public string? Era { get; set; }
    public string? AvatarUrl { get; set; }
    public string? BackgroundUrl { get; set; }
    public List<string> CoreTeachings { get; set; } = new();
    public string? TeachingApproach { get; set; }
    public string? TeachingTone { get; set; }
    public string? TeachingFocus { get; set; }
    public string? TeachingComplexity { get; set; }
    public List<string> PersonalityTraits { get; set; } = new();
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class CreateTeacherRequest
{
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
    public string? Nationality { get; set; }
    public string? Description { get; set; }
    public string? TraditionName { get; set; }
    public string? TraditionDescription { get; set; }
    public string? TraditionOrigin { get; set; }
    public string? Era { get; set; }
    public string? AvatarUrl { get; set; }
    public string? BackgroundUrl { get; set; }
    public List<string> CoreTeachings { get; set; } = new();
    public string? TeachingApproach { get; set; }
    public string? TeachingTone { get; set; }
    public string? TeachingFocus { get; set; }
    public string? TeachingComplexity { get; set; }
    public List<string> PersonalityTraits { get; set; } = new();
}

public class UpdateTeacherRequest
{
    public string? DisplayName { get; set; }
    public string? FullName { get; set; }
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
    public string? Nationality { get; set; }
    public string? Description { get; set; }
    public string? TraditionName { get; set; }
    public string? TraditionDescription { get; set; }
    public string? TraditionOrigin { get; set; }
    public string? Era { get; set; }
    public string? AvatarUrl { get; set; }
    public string? BackgroundUrl { get; set; }
    public List<string>? CoreTeachings { get; set; }
    public string? TeachingApproach { get; set; }
    public string? TeachingTone { get; set; }
    public string? TeachingFocus { get; set; }
    public string? TeachingComplexity { get; set; }
    public List<string>? PersonalityTraits { get; set; }
    public bool? IsActive { get; set; }
}

public class TeacherResponse
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string? FullName { get; set; }
    public int? BirthYear { get; set; }
    public int? DeathYear { get; set; }
    public string? Nationality { get; set; }
    public string? Description { get; set; }
    public string? TraditionName { get; set; }
    public string? TraditionDescription { get; set; }
    public string? TraditionOrigin { get; set; }
    public string? Era { get; set; }
    public string? AvatarUrl { get; set; }
    public string? BackgroundUrl { get; set; }
    public List<string> CoreTeachings { get; set; } = new();
    public string? TeachingApproach { get; set; }
    public string? TeachingTone { get; set; }
    public string? TeachingFocus { get; set; }
    public string? TeachingComplexity { get; set; }
    public List<string> PersonalityTraits { get; set; } = new();
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}
