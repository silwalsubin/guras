namespace services.journal.Requests;

/// <summary>
/// Request to update an existing journal entry
/// </summary>
public class UpdateJournalEntryRequest
{
    public string? Content { get; set; }
    public string? Mood { get; set; }
    public int? MoodScore { get; set; }
    public string[]? Tags { get; set; }
}

