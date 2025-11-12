namespace services.journal.Domain;

/// <summary>
/// Represents the association between a journal entry and an emotion
/// </summary>
public class JournalEntryEmotion
{
    public Guid Id { get; set; }
    public Guid JournalEntryId { get; set; }
    public string EmotionId { get; set; } = string.Empty; // References emotions service
    public DateTime CreatedAt { get; set; }
}

