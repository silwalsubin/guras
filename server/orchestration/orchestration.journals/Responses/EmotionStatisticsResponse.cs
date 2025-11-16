namespace orchestration.journals.Responses;

/// <summary>
/// Response containing emotion statistics for a user
/// </summary>
public class EmotionStatisticsResponse
{
    public List<EmotionDetailResponse> Emotions { get; set; } = new();
    public int TotalEntries { get; set; }
    public DateTime CalculatedAt { get; set; }
    public DateRangeResponse DateRange { get; set; } = new();
}

/// <summary>
/// Response containing emotion details with count
/// </summary>
public class EmotionDetailResponse
{
    public string EmotionId { get; set; } = string.Empty;
    public string EmotionName { get; set; } = string.Empty;
    public string EmotionColor { get; set; } = string.Empty;
    public int Count { get; set; }
}

/// <summary>
/// Response containing date range information
/// </summary>
public class DateRangeResponse
{
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string PeriodLabel { get; set; } = string.Empty;
}

