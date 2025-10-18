using services.teachers.Domain;
using services.teachers.Models;

namespace services.teachers.Services;

public static class TeacherMappingService
{
    public static TeacherEntity ToEntity(this Teacher teacher)
    {
        return new TeacherEntity
        {
            Id = teacher.Id,
            Name = teacher.Name,
            DisplayName = teacher.DisplayName,
            FullName = teacher.FullName,
            BirthYear = teacher.BirthYear,
            DeathYear = teacher.DeathYear,
            Nationality = teacher.Nationality,
            Description = teacher.Description,
            TraditionName = teacher.TraditionName,
            TraditionDescription = teacher.TraditionDescription,
            TraditionOrigin = teacher.TraditionOrigin,
            Era = teacher.Era,
            AvatarUrl = teacher.AvatarUrl,
            BackgroundUrl = teacher.BackgroundUrl,
            CoreTeachings = teacher.CoreTeachings,
            TeachingApproach = teacher.TeachingApproach,
            TeachingTone = teacher.TeachingTone,
            TeachingFocus = teacher.TeachingFocus,
            TeachingComplexity = teacher.TeachingComplexity,
            PersonalityTraits = teacher.PersonalityTraits,
            IsActive = teacher.IsActive,
            CreatedAt = teacher.CreatedAt,
            UpdatedAt = teacher.UpdatedAt
        };
    }

    public static Teacher ToDomain(this TeacherEntity entity)
    {
        return new Teacher
        {
            Id = entity.Id,
            Name = entity.Name,
            DisplayName = entity.DisplayName,
            FullName = entity.FullName,
            BirthYear = entity.BirthYear,
            DeathYear = entity.DeathYear,
            Nationality = entity.Nationality,
            Description = entity.Description,
            TraditionName = entity.TraditionName,
            TraditionDescription = entity.TraditionDescription,
            TraditionOrigin = entity.TraditionOrigin,
            Era = entity.Era,
            AvatarUrl = entity.AvatarUrl,
            BackgroundUrl = entity.BackgroundUrl,
            CoreTeachings = entity.CoreTeachings,
            TeachingApproach = entity.TeachingApproach,
            TeachingTone = entity.TeachingTone,
            TeachingFocus = entity.TeachingFocus,
            TeachingComplexity = entity.TeachingComplexity,
            PersonalityTraits = entity.PersonalityTraits,
            IsActive = entity.IsActive,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static TeacherResponse ToResponse(this Teacher teacher)
    {
        return new TeacherResponse
        {
            Id = teacher.Id,
            Name = teacher.Name,
            DisplayName = teacher.DisplayName,
            FullName = teacher.FullName,
            BirthYear = teacher.BirthYear,
            DeathYear = teacher.DeathYear,
            Nationality = teacher.Nationality,
            Description = teacher.Description,
            TraditionName = teacher.TraditionName,
            TraditionDescription = teacher.TraditionDescription,
            TraditionOrigin = teacher.TraditionOrigin,
            Era = teacher.Era,
            AvatarUrl = teacher.AvatarUrl,
            BackgroundUrl = teacher.BackgroundUrl,
            CoreTeachings = teacher.CoreTeachings,
            TeachingApproach = teacher.TeachingApproach,
            TeachingTone = teacher.TeachingTone,
            TeachingFocus = teacher.TeachingFocus,
            TeachingComplexity = teacher.TeachingComplexity,
            PersonalityTraits = teacher.PersonalityTraits,
            IsActive = teacher.IsActive,
            CreatedAt = teacher.CreatedAt,
            UpdatedAt = teacher.UpdatedAt
        };
    }

    public static Teacher ToDomain(this CreateTeacherRequest request)
    {
        return new Teacher
        {
            Name = request.Name,
            DisplayName = request.DisplayName,
            FullName = request.FullName,
            BirthYear = request.BirthYear,
            DeathYear = request.DeathYear,
            Nationality = request.Nationality,
            Description = request.Description,
            TraditionName = request.TraditionName,
            TraditionDescription = request.TraditionDescription,
            TraditionOrigin = request.TraditionOrigin,
            Era = request.Era,
            AvatarUrl = request.AvatarUrl,
            BackgroundUrl = request.BackgroundUrl,
            CoreTeachings = request.CoreTeachings,
            TeachingApproach = request.TeachingApproach,
            TeachingTone = request.TeachingTone,
            TeachingFocus = request.TeachingFocus,
            TeachingComplexity = request.TeachingComplexity,
            PersonalityTraits = request.PersonalityTraits,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }
}
