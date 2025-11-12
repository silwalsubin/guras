namespace services.journal.Requests;

/// <summary>
/// Request to create a new journal entry
/// </summary>
public class CreateJournalEntryRequest
{
    public string Content { get; set; } = string.Empty;
    // Emotions and Mood are determined by AI, not provided by client
}

