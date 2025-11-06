namespace services.meditation.Domain;

/// <summary>
/// DTO for meditation recommendations
/// </summary>
public class MeditationRecommendationDto
{
    public string Title { get; set; } = string.Empty;
    public string Theme { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "beginner";
    public int Duration { get; set; } = 10;
    public string Reason { get; set; } = "Personalized for you";
}

/// <summary>
/// DTO for recommendation reason response
/// </summary>
public class RecommendationReasonDto
{
    public string SessionTitle { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
}

