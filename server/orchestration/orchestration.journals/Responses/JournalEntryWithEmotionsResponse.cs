using services.emotions.Domain;

namespace orchestration.journals.Responses;

/// <summary>
/// Response containing journal entry with enriched emotion data
/// </summary>
public class JournalEntryWithEmotionsResponse
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
    
    /// <summary>
    /// Emotions associated with this journal entry with full emotion data
    /// </summary>
    public List<EmotionResponse> Emotions { get; set; } = new();
}

