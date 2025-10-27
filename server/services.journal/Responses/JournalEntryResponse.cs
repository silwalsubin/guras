namespace services.journal.Responses;

/// <summary>
/// Response containing journal entry data
/// </summary>
public class JournalEntryResponse
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

