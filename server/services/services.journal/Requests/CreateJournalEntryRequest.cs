namespace services.journal.Requests;

/// <summary>
/// Request to create a new journal entry
/// </summary>
public class CreateJournalEntryRequest
{
    public string Content { get; set; } = string.Empty;
    public string[]? Tags { get; set; }
    public List<string>? EmotionIds { get; set; } // Emotion IDs associated with this entry
    // Mood and MoodScore are determined by AI, not provided by client
}

