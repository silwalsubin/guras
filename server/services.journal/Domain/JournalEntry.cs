namespace services.journal.Domain;

/// <summary>
/// Represents a journal entry in the database
/// </summary>
public class JournalEntry
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Mood { get; set; }
    public int? MoodScore { get; set; }
    public string[]? Tags { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public bool IsDeleted { get; set; }
}

