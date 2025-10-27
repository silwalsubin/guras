namespace services.journal.Requests;

/// <summary>
/// Request to create a new journal entry
/// </summary>
public class CreateJournalEntryRequest
{
    public string Content { get; set; } = string.Empty;
    public string? Mood { get; set; }
    public int? MoodScore { get; set; }
    public string[]? Tags { get; set; }
}

