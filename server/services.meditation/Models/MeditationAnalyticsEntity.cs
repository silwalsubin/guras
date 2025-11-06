using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace services.meditation.Models;

[Table("meditation_analytics")]
public class MeditationAnalyticsEntity
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; }

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [Required]
    [MaxLength(255)]
    [Column("session_id")]
    public string SessionId { get; set; } = string.Empty;

    [MaxLength(255)]
    [Column("session_title")]
    public string? SessionTitle { get; set; }

    [Column("teacher_id")]
    public Guid? TeacherId { get; set; }

    [MaxLength(255)]
    [Column("teacher_name")]
    public string? TeacherName { get; set; }

    [Column("music_id")]
    public Guid? MusicId { get; set; }

    [MaxLength(255)]
    [Column("music_name")]
    public string? MusicName { get; set; }

    [Required]
    [Column("session_start_time")]
    public DateTime SessionStartTime { get; set; }

    [Column("session_end_time")]
    public DateTime? SessionEndTime { get; set; }

    [Column("duration_seconds")]
    public int? DurationSeconds { get; set; }

    [Column("planned_duration_seconds")]
    public int? PlannedDurationSeconds { get; set; }

    [MaxLength(100)]
    [Column("meditation_theme")]
    public string? MeditationTheme { get; set; }

    [MaxLength(50)]
    [Column("difficulty_level")]
    public string? DifficultyLevel { get; set; }

    [Column("is_program_session")]
    public bool IsProgramSession { get; set; }

    [Column("program_id")]
    public Guid? ProgramId { get; set; }

    [Column("program_day")]
    public int? ProgramDay { get; set; }

    [Column("completed")]
    public bool Completed { get; set; }

    [Column("completion_percentage")]
    public int CompletionPercentage { get; set; }

    [MaxLength(50)]
    [Column("emotional_state_before")]
    public string? EmotionalStateBefore { get; set; }

    [Column("emotional_state_before_score")]
    public int? EmotionalStateBeforeScore { get; set; }

    [MaxLength(50)]
    [Column("emotional_state_after")]
    public string? EmotionalStateAfter { get; set; }

    [Column("emotional_state_after_score")]
    public int? EmotionalStateAfterScore { get; set; }

    [Column("user_rating")]
    public int? UserRating { get; set; }

    [Column("user_notes")]
    public string? UserNotes { get; set; }

    [MaxLength(50)]
    [Column("time_of_day")]
    public string? TimeOfDay { get; set; }

    [MaxLength(20)]
    [Column("day_of_week")]
    public string? DayOfWeek { get; set; }

    [Column("paused_count")]
    public int PausedCount { get; set; }

    [Column("total_pause_duration_seconds")]
    public int TotalPauseDurationSeconds { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

