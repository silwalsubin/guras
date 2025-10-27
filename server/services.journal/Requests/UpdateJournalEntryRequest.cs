namespace services.journal.Requests;

/// <summary>
/// Request to update an existing journal entry
/// </summary>
public class UpdateJournalEntryRequest
{
    public string? Title { get; set; }
    public string? Content { get; set; }
    public string[]? Tags { get; set; }
}

