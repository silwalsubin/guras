namespace services.journal.Domain;

/// <summary>
/// Represents the count of a specific emotion for a user
/// </summary>
public class EmotionCount
{
    public string EmotionId { get; set; } = string.Empty;
    public int Count { get; set; }
}

