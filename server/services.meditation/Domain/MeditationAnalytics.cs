namespace services.meditation.Domain;

/// <summary>
/// Represents a meditation session analytics record for tracking user patterns and enabling AI recommendations
/// </summary>
public class MeditationAnalytics
{
    /// <summary>
    /// Unique identifier for the analytics record
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Reference to the user who completed the session
    /// </summary>
    public Guid UserId { get; set; }

    /// <summary>
    /// Unique identifier for the meditation session
    /// </summary>
    public string SessionId { get; set; } = string.Empty;

    // Session Details
    /// <summary>
    /// Title of the meditation session
    /// </summary>
    public string? SessionTitle { get; set; }

    /// <summary>
    /// Reference to the teacher who led the session
    /// </summary>
    public Guid? TeacherId { get; set; }

    /// <summary>
    /// Name of the teacher (denormalized for query efficiency)
    /// </summary>
    public string? TeacherName { get; set; }

    /// <summary>
    /// Reference to the music/audio file used in the session
    /// </summary>
    public Guid? MusicId { get; set; }

    /// <summary>
    /// Name of the music/audio file (denormalized for query efficiency)
    /// </summary>
    public string? MusicName { get; set; }

    // Timing Information
    /// <summary>
    /// When the meditation session started
    /// </summary>
    public DateTime SessionStartTime { get; set; }

    /// <summary>
    /// When the meditation session ended
    /// </summary>
    public DateTime? SessionEndTime { get; set; }

    /// <summary>
    /// Actual duration of meditation completed in seconds
    /// </summary>
    public int? DurationSeconds { get; set; }

    /// <summary>
    /// Originally planned duration in seconds
    /// </summary>
    public int? PlannedDurationSeconds { get; set; }

    // Session Metadata
    /// <summary>
    /// Theme/category of meditation (e.g., 'mindfulness', 'sleep', 'stress-relief')
    /// </summary>
    public string? MeditationTheme { get; set; }

    /// <summary>
    /// Difficulty level of the session (e.g., 'beginner', 'intermediate', 'advanced')
    /// </summary>
    public string? DifficultyLevel { get; set; }

    /// <summary>
    /// Whether this session is part of a meditation program
    /// </summary>
    public bool IsProgramSession { get; set; }

    /// <summary>
    /// Reference to the meditation program if applicable
    /// </summary>
    public Guid? ProgramId { get; set; }

    /// <summary>
    /// Day number in the program if applicable
    /// </summary>
    public int? ProgramDay { get; set; }

    // Completion Status
    /// <summary>
    /// Whether the user completed the full session
    /// </summary>
    public bool Completed { get; set; }

    /// <summary>
    /// Percentage of session completed (0-100)
    /// </summary>
    public int CompletionPercentage { get; set; }

    // Emotional State Tracking
    /// <summary>
    /// User's emotional state before meditation (e.g., 'stressed', 'anxious', 'neutral', 'happy')
    /// </summary>
    public string? EmotionalStateBeforeType { get; set; }

    /// <summary>
    /// Numerical score of emotional state before meditation (1-10 scale)
    /// </summary>
    public int? EmotionalStateBeforeScore { get; set; }

    /// <summary>
    /// User's emotional state after meditation
    /// </summary>
    public string? EmotionalStateAfterType { get; set; }

    /// <summary>
    /// Numerical score of emotional state after meditation (1-10 scale)
    /// </summary>
    public int? EmotionalStateAfterScore { get; set; }

    // User Feedback
    /// <summary>
    /// User's rating of the session (1-5 stars)
    /// </summary>
    public int? UserRating { get; set; }

    /// <summary>
    /// Optional notes from the user about the session
    /// </summary>
    public string? UserNotes { get; set; }

    // Environmental Context
    /// <summary>
    /// Time period when session occurred (e.g., 'morning', 'afternoon', 'evening', 'night')
    /// </summary>
    public string? TimeOfDay { get; set; }

    /// <summary>
    /// Day of week when session occurred (e.g., 'monday', 'tuesday')
    /// </summary>
    public string? DayOfWeek { get; set; }

    // Engagement Metrics
    /// <summary>
    /// Number of times user paused during session
    /// </summary>
    public int PausedCount { get; set; }

    /// <summary>
    /// Total time spent paused during session in seconds
    /// </summary>
    public int TotalPauseDurationSeconds { get; set; }

    // Metadata
    /// <summary>
    /// Timestamp when the record was created
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// Timestamp when the record was last updated
    /// </summary>
    public DateTime UpdatedAt { get; set; }
}

/// <summary>
/// DTO for creating a new meditation analytics record
/// </summary>
public class CreateMeditationAnalyticsDto
{
    public string SessionId { get; set; } = string.Empty;
    public string? SessionTitle { get; set; }
    public Guid? TeacherId { get; set; }
    public string? TeacherName { get; set; }
    public Guid? MusicId { get; set; }
    public string? MusicName { get; set; }
    public DateTime SessionStartTime { get; set; }
    public DateTime? SessionEndTime { get; set; }
    public int? DurationSeconds { get; set; }
    public int? PlannedDurationSeconds { get; set; }
    public string? MeditationTheme { get; set; }
    public string? DifficultyLevel { get; set; }
    public bool IsProgramSession { get; set; }
    public Guid? ProgramId { get; set; }
    public int? ProgramDay { get; set; }
    public bool Completed { get; set; }
    public int CompletionPercentage { get; set; }
    public string? EmotionalStateBeforeType { get; set; }
    public int? EmotionalStateBeforeScore { get; set; }
    public string? EmotionalStateAfterType { get; set; }
    public int? EmotionalStateAfterScore { get; set; }
    public int? UserRating { get; set; }
    public string? UserNotes { get; set; }
    public string? TimeOfDay { get; set; }
    public string? DayOfWeek { get; set; }
    public int PausedCount { get; set; }
    public int TotalPauseDurationSeconds { get; set; }
}

/// <summary>
/// DTO for retrieving meditation analytics
/// </summary>
public class MeditationAnalyticsDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string SessionId { get; set; } = string.Empty;
    public string? SessionTitle { get; set; }
    public string? TeacherName { get; set; }
    public string? MusicName { get; set; }
    public DateTime SessionStartTime { get; set; }
    public int? DurationSeconds { get; set; }
    public string? MeditationTheme { get; set; }
    public string? DifficultyLevel { get; set; }
    public bool Completed { get; set; }
    public int CompletionPercentage { get; set; }
    public int? EmotionalStateBeforeScore { get; set; }
    public int? EmotionalStateAfterScore { get; set; }
    public int? UserRating { get; set; }
    public string? TimeOfDay { get; set; }
    public DateTime CreatedAt { get; set; }
}

