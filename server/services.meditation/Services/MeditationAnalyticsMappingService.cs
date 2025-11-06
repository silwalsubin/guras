using services.meditation.Domain;
using services.meditation.Models;

namespace services.meditation.Services;

public static class MeditationAnalyticsMappingService
{
    public static MeditationAnalyticsEntity ToEntity(this MeditationAnalytics analytics)
    {
        return new MeditationAnalyticsEntity
        {
            Id = analytics.Id,
            UserId = analytics.UserId,
            SessionId = analytics.SessionId,
            SessionTitle = analytics.SessionTitle,
            TeacherId = analytics.TeacherId,
            TeacherName = analytics.TeacherName,
            MusicId = analytics.MusicId,
            MusicName = analytics.MusicName,
            SessionStartTime = analytics.SessionStartTime,
            SessionEndTime = analytics.SessionEndTime,
            DurationSeconds = analytics.DurationSeconds,
            PlannedDurationSeconds = analytics.PlannedDurationSeconds,
            MeditationTheme = analytics.MeditationTheme,
            DifficultyLevel = analytics.DifficultyLevel,
            IsProgramSession = analytics.IsProgramSession,
            ProgramId = analytics.ProgramId,
            ProgramDay = analytics.ProgramDay,
            Completed = analytics.Completed,
            CompletionPercentage = analytics.CompletionPercentage,
            EmotionalStateBefore = analytics.EmotionalStateBeforeType,
            EmotionalStateBeforeScore = analytics.EmotionalStateBeforeScore,
            EmotionalStateAfter = analytics.EmotionalStateAfterType,
            EmotionalStateAfterScore = analytics.EmotionalStateAfterScore,
            UserRating = analytics.UserRating,
            UserNotes = analytics.UserNotes,
            TimeOfDay = analytics.TimeOfDay,
            DayOfWeek = analytics.DayOfWeek,
            PausedCount = analytics.PausedCount,
            TotalPauseDurationSeconds = analytics.TotalPauseDurationSeconds,
            CreatedAt = analytics.CreatedAt,
            UpdatedAt = analytics.UpdatedAt
        };
    }

    public static MeditationAnalytics ToDomain(this MeditationAnalyticsEntity entity)
    {
        return new MeditationAnalytics
        {
            Id = entity.Id,
            UserId = entity.UserId,
            SessionId = entity.SessionId,
            SessionTitle = entity.SessionTitle,
            TeacherId = entity.TeacherId,
            TeacherName = entity.TeacherName,
            MusicId = entity.MusicId,
            MusicName = entity.MusicName,
            SessionStartTime = entity.SessionStartTime,
            SessionEndTime = entity.SessionEndTime,
            DurationSeconds = entity.DurationSeconds,
            PlannedDurationSeconds = entity.PlannedDurationSeconds,
            MeditationTheme = entity.MeditationTheme,
            DifficultyLevel = entity.DifficultyLevel,
            IsProgramSession = entity.IsProgramSession,
            ProgramId = entity.ProgramId,
            ProgramDay = entity.ProgramDay,
            Completed = entity.Completed,
            CompletionPercentage = entity.CompletionPercentage,
            EmotionalStateBeforeType = entity.EmotionalStateBefore,
            EmotionalStateBeforeScore = entity.EmotionalStateBeforeScore,
            EmotionalStateAfterType = entity.EmotionalStateAfter,
            EmotionalStateAfterScore = entity.EmotionalStateAfterScore,
            UserRating = entity.UserRating,
            UserNotes = entity.UserNotes,
            TimeOfDay = entity.TimeOfDay,
            DayOfWeek = entity.DayOfWeek,
            PausedCount = entity.PausedCount,
            TotalPauseDurationSeconds = entity.TotalPauseDurationSeconds,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static MeditationAnalytics ToDomain(this CreateMeditationAnalyticsDto dto, Guid userId)
    {
        return new MeditationAnalytics
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            SessionId = dto.SessionId,
            SessionTitle = dto.SessionTitle,
            TeacherId = dto.TeacherId,
            TeacherName = dto.TeacherName,
            MusicId = dto.MusicId,
            MusicName = dto.MusicName,
            SessionStartTime = dto.SessionStartTime,
            SessionEndTime = dto.SessionEndTime,
            DurationSeconds = dto.DurationSeconds,
            PlannedDurationSeconds = dto.PlannedDurationSeconds,
            MeditationTheme = dto.MeditationTheme,
            DifficultyLevel = dto.DifficultyLevel,
            IsProgramSession = dto.IsProgramSession,
            ProgramId = dto.ProgramId,
            ProgramDay = dto.ProgramDay,
            Completed = dto.Completed,
            CompletionPercentage = dto.CompletionPercentage,
            EmotionalStateBeforeType = dto.EmotionalStateBeforeType,
            EmotionalStateBeforeScore = dto.EmotionalStateBeforeScore,
            EmotionalStateAfterType = dto.EmotionalStateAfterType,
            EmotionalStateAfterScore = dto.EmotionalStateAfterScore,
            UserRating = dto.UserRating,
            UserNotes = dto.UserNotes,
            TimeOfDay = dto.TimeOfDay,
            DayOfWeek = dto.DayOfWeek,
            PausedCount = dto.PausedCount,
            TotalPauseDurationSeconds = dto.TotalPauseDurationSeconds,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}

