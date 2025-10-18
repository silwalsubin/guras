using FluentAssertions;
using services.teachers.Domain;
using services.teachers.Models;
using services.teachers.Services;
using Xunit;

namespace tests;

public class TeacherMappingServiceTests
{
    #region ToEntity Tests

    [Fact]
    public void ToEntity_ShouldMapAllProperties_WhenValidTeacher()
    {
        // Arrange
        var teacher = new Teacher
        {
            Id = Guid.NewGuid(),
            Name = "Osho",
            DisplayName = "Osho Rajneesh",
            FullName = "Bhagwan Shree Rajneesh",
            BirthYear = 1931,
            DeathYear = 1990,
            Nationality = "Indian",
            Description = "Spiritual teacher and philosopher",
            TraditionName = "Osho Movement",
            TraditionDescription = "A spiritual movement",
            TraditionOrigin = "India",
            Era = "Modern",
            AvatarUrl = "https://example.com/avatar.jpg",
            BackgroundUrl = "https://example.com/background.jpg",
            CoreTeachings = new List<string> { "Meditation", "Consciousness" },
            TeachingApproach = "Direct",
            TeachingTone = "Provocative",
            TeachingFocus = "Self-realization",
            TeachingComplexity = "Advanced",
            PersonalityTraits = new List<string> { "Wise", "Compassionate" },
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var entity = teacher.ToEntity();

        // Assert
        entity.Should().NotBeNull();
        entity.Id.Should().Be(teacher.Id);
        entity.Name.Should().Be(teacher.Name);
        entity.DisplayName.Should().Be(teacher.DisplayName);
        entity.FullName.Should().Be(teacher.FullName);
        entity.BirthYear.Should().Be(teacher.BirthYear);
        entity.DeathYear.Should().Be(teacher.DeathYear);
        entity.Nationality.Should().Be(teacher.Nationality);
        entity.Description.Should().Be(teacher.Description);
        entity.TraditionName.Should().Be(teacher.TraditionName);
        entity.TraditionDescription.Should().Be(teacher.TraditionDescription);
        entity.TraditionOrigin.Should().Be(teacher.TraditionOrigin);
        entity.Era.Should().Be(teacher.Era);
        entity.AvatarUrl.Should().Be(teacher.AvatarUrl);
        entity.BackgroundUrl.Should().Be(teacher.BackgroundUrl);
        entity.CoreTeachings.Should().BeEquivalentTo(teacher.CoreTeachings);
        entity.TeachingApproach.Should().Be(teacher.TeachingApproach);
        entity.TeachingTone.Should().Be(teacher.TeachingTone);
        entity.TeachingFocus.Should().Be(teacher.TeachingFocus);
        entity.TeachingComplexity.Should().Be(teacher.TeachingComplexity);
        entity.PersonalityTraits.Should().BeEquivalentTo(teacher.PersonalityTraits);
        entity.IsActive.Should().Be(teacher.IsActive);
        entity.CreatedAt.Should().Be(teacher.CreatedAt);
        entity.UpdatedAt.Should().Be(teacher.UpdatedAt);
    }

    [Fact]
    public void ToEntity_ShouldHandleNullLists_WhenListsAreNull()
    {
        // Arrange
        var teacher = new Teacher
        {
            Id = Guid.NewGuid(),
            Name = "TestTeacher",
            DisplayName = "Test Teacher"
        };
        // Set lists to null after construction
        teacher.CoreTeachings = null!;
        teacher.PersonalityTraits = null!;

        // Act
        var entity = teacher.ToEntity();

        // Assert
        entity.Should().NotBeNull();
        entity.CoreTeachings.Should().BeNull();
        entity.PersonalityTraits.Should().BeNull();
    }

    [Fact]
    public void ToEntity_ShouldHandleEmptyLists_WhenListsAreEmpty()
    {
        // Arrange
        var teacher = new Teacher
        {
            Id = Guid.NewGuid(),
            Name = "TestTeacher",
            DisplayName = "Test Teacher",
            CoreTeachings = new List<string>(),
            PersonalityTraits = new List<string>()
        };

        // Act
        var entity = teacher.ToEntity();

        // Assert
        entity.Should().NotBeNull();
        entity.CoreTeachings.Should().NotBeNull();
        entity.CoreTeachings.Should().BeEmpty();
        entity.PersonalityTraits.Should().NotBeNull();
        entity.PersonalityTraits.Should().BeEmpty();
    }

    #endregion

    #region ToDomain Tests

    [Fact]
    public void ToDomain_ShouldMapAllProperties_WhenValidEntity()
    {
        // Arrange
        var entity = new TeacherEntity
        {
            Id = Guid.NewGuid(),
            Name = "Osho",
            DisplayName = "Osho Rajneesh",
            FullName = "Bhagwan Shree Rajneesh",
            BirthYear = 1931,
            DeathYear = 1990,
            Nationality = "Indian",
            Description = "Spiritual teacher and philosopher",
            TraditionName = "Osho Movement",
            TraditionDescription = "A spiritual movement",
            TraditionOrigin = "India",
            Era = "Modern",
            AvatarUrl = "https://example.com/avatar.jpg",
            BackgroundUrl = "https://example.com/background.jpg",
            CoreTeachings = new List<string> { "Meditation", "Consciousness" },
            TeachingApproach = "Direct",
            TeachingTone = "Provocative",
            TeachingFocus = "Self-realization",
            TeachingComplexity = "Advanced",
            PersonalityTraits = new List<string> { "Wise", "Compassionate" },
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var teacher = entity.ToDomain();

        // Assert
        teacher.Should().NotBeNull();
        teacher.Id.Should().Be(entity.Id);
        teacher.Name.Should().Be(entity.Name);
        teacher.DisplayName.Should().Be(entity.DisplayName);
        teacher.FullName.Should().Be(entity.FullName);
        teacher.BirthYear.Should().Be(entity.BirthYear);
        teacher.DeathYear.Should().Be(entity.DeathYear);
        teacher.Nationality.Should().Be(entity.Nationality);
        teacher.Description.Should().Be(entity.Description);
        teacher.TraditionName.Should().Be(entity.TraditionName);
        teacher.TraditionDescription.Should().Be(entity.TraditionDescription);
        teacher.TraditionOrigin.Should().Be(entity.TraditionOrigin);
        teacher.Era.Should().Be(entity.Era);
        teacher.AvatarUrl.Should().Be(entity.AvatarUrl);
        teacher.BackgroundUrl.Should().Be(entity.BackgroundUrl);
        teacher.CoreTeachings.Should().BeEquivalentTo(entity.CoreTeachings);
        teacher.TeachingApproach.Should().Be(entity.TeachingApproach);
        teacher.TeachingTone.Should().Be(entity.TeachingTone);
        teacher.TeachingFocus.Should().Be(entity.TeachingFocus);
        teacher.TeachingComplexity.Should().Be(entity.TeachingComplexity);
        teacher.PersonalityTraits.Should().BeEquivalentTo(entity.PersonalityTraits);
        teacher.IsActive.Should().Be(entity.IsActive);
        teacher.CreatedAt.Should().Be(entity.CreatedAt);
        teacher.UpdatedAt.Should().Be(entity.UpdatedAt);
    }

    [Fact]
    public void ToDomain_ShouldHandleNullLists_WhenListsAreNull()
    {
        // Arrange
        var entity = new TeacherEntity
        {
            Id = Guid.NewGuid(),
            Name = "TestTeacher",
            DisplayName = "Test Teacher",
            CoreTeachings = null!,
            PersonalityTraits = null!
        };

        // Act
        var teacher = entity.ToDomain();

        // Assert
        teacher.Should().NotBeNull();
        teacher.CoreTeachings.Should().BeNull();
        teacher.PersonalityTraits.Should().BeNull();
    }

    [Fact]
    public void ToDomain_ShouldHandleEmptyLists_WhenListsAreEmpty()
    {
        // Arrange
        var entity = new TeacherEntity
        {
            Id = Guid.NewGuid(),
            Name = "TestTeacher",
            DisplayName = "Test Teacher",
            CoreTeachings = new List<string>(),
            PersonalityTraits = new List<string>()
        };

        // Act
        var teacher = entity.ToDomain();

        // Assert
        teacher.Should().NotBeNull();
        teacher.CoreTeachings.Should().NotBeNull();
        teacher.CoreTeachings.Should().BeEmpty();
        teacher.PersonalityTraits.Should().NotBeNull();
        teacher.PersonalityTraits.Should().BeEmpty();
    }

    #endregion

    #region Round-trip Mapping Tests

    [Fact]
    public void RoundTripMapping_ShouldPreserveAllData_WhenMappingDomainToEntityAndBack()
    {
        // Arrange
        var originalTeacher = new Teacher
        {
            Id = Guid.NewGuid(),
            Name = "Osho",
            DisplayName = "Osho Rajneesh",
            FullName = "Bhagwan Shree Rajneesh",
            BirthYear = 1931,
            DeathYear = 1990,
            Nationality = "Indian",
            Description = "Spiritual teacher and philosopher",
            TraditionName = "Osho Movement",
            TraditionDescription = "A spiritual movement",
            TraditionOrigin = "India",
            Era = "Modern",
            AvatarUrl = "https://example.com/avatar.jpg",
            BackgroundUrl = "https://example.com/background.jpg",
            CoreTeachings = new List<string> { "Meditation", "Consciousness", "Awareness" },
            TeachingApproach = "Direct",
            TeachingTone = "Provocative",
            TeachingFocus = "Self-realization",
            TeachingComplexity = "Advanced",
            PersonalityTraits = new List<string> { "Wise", "Compassionate", "Revolutionary" },
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var entity = originalTeacher.ToEntity();
        var mappedBackTeacher = entity.ToDomain();

        // Assert
        mappedBackTeacher.Should().BeEquivalentTo(originalTeacher);
    }

    [Fact]
    public void RoundTripMapping_ShouldPreserveAllData_WhenMappingEntityToDomainAndBack()
    {
        // Arrange
        var originalEntity = new TeacherEntity
        {
            Id = Guid.NewGuid(),
            Name = "Buddha",
            DisplayName = "Siddhartha Gautama",
            FullName = "Siddhartha Gautama Buddha",
            BirthYear = 563,
            DeathYear = 483,
            Nationality = "Indian",
            Description = "Enlightened teacher and founder of Buddhism",
            TraditionName = "Buddhism",
            TraditionDescription = "A major world religion",
            TraditionOrigin = "India",
            Era = "Ancient",
            AvatarUrl = "https://example.com/buddha.jpg",
            BackgroundUrl = "https://example.com/buddha-bg.jpg",
            CoreTeachings = new List<string> { "Four Noble Truths", "Eightfold Path", "Meditation" },
            TeachingApproach = "Gradual",
            TeachingTone = "Compassionate",
            TeachingFocus = "Enlightenment",
            TeachingComplexity = "Advanced",
            PersonalityTraits = new List<string> { "Wise", "Compassionate", "Patient" },
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var teacher = originalEntity.ToDomain();
        var mappedBackEntity = teacher.ToEntity();

        // Assert
        mappedBackEntity.Should().BeEquivalentTo(originalEntity);
    }

    #endregion

    #region Edge Cases Tests

    [Fact]
    public void ToEntity_ShouldHandleMinimalTeacher_WhenOnlyRequiredFieldsAreSet()
    {
        // Arrange
        var teacher = new Teacher
        {
            Id = Guid.NewGuid(),
            Name = "MinimalTeacher",
            DisplayName = "Minimal Teacher"
        };

        // Act
        var entity = teacher.ToEntity();

        // Assert
        entity.Should().NotBeNull();
        entity.Id.Should().Be(teacher.Id);
        entity.Name.Should().Be(teacher.Name);
        entity.DisplayName.Should().Be(teacher.DisplayName);
        entity.FullName.Should().BeNull();
        entity.BirthYear.Should().BeNull();
        entity.DeathYear.Should().BeNull();
        entity.Nationality.Should().BeNull();
        entity.Description.Should().BeNull();
        entity.TraditionName.Should().BeNull();
        entity.TraditionDescription.Should().BeNull();
        entity.TraditionOrigin.Should().BeNull();
        entity.Era.Should().BeNull();
        entity.AvatarUrl.Should().BeNull();
        entity.BackgroundUrl.Should().BeNull();
        entity.CoreTeachings.Should().BeEmpty();
        entity.TeachingApproach.Should().BeNull();
        entity.TeachingTone.Should().BeNull();
        entity.TeachingFocus.Should().BeNull();
        entity.TeachingComplexity.Should().BeNull();
        entity.PersonalityTraits.Should().BeEmpty();
        entity.IsActive.Should().BeTrue(); // Default value
        entity.CreatedAt.Should().Be(teacher.CreatedAt);
        entity.UpdatedAt.Should().Be(teacher.UpdatedAt);
    }

    [Fact]
    public void ToDomain_ShouldHandleMinimalEntity_WhenOnlyRequiredFieldsAreSet()
    {
        // Arrange
        var entity = new TeacherEntity
        {
            Id = Guid.NewGuid(),
            Name = "MinimalTeacher",
            DisplayName = "Minimal Teacher"
        };

        // Act
        var teacher = entity.ToDomain();

        // Assert
        teacher.Should().NotBeNull();
        teacher.Id.Should().Be(entity.Id);
        teacher.Name.Should().Be(entity.Name);
        teacher.DisplayName.Should().Be(entity.DisplayName);
        teacher.FullName.Should().BeNull();
        teacher.BirthYear.Should().BeNull();
        teacher.DeathYear.Should().BeNull();
        teacher.Nationality.Should().BeNull();
        teacher.Description.Should().BeNull();
        teacher.TraditionName.Should().BeNull();
        teacher.TraditionDescription.Should().BeNull();
        teacher.TraditionOrigin.Should().BeNull();
        teacher.Era.Should().BeNull();
        teacher.AvatarUrl.Should().BeNull();
        teacher.BackgroundUrl.Should().BeNull();
        teacher.CoreTeachings.Should().BeEmpty();
        teacher.TeachingApproach.Should().BeNull();
        teacher.TeachingTone.Should().BeNull();
        teacher.TeachingFocus.Should().BeNull();
        teacher.TeachingComplexity.Should().BeNull();
        teacher.PersonalityTraits.Should().BeEmpty();
        teacher.IsActive.Should().Be(entity.IsActive);
        teacher.CreatedAt.Should().Be(entity.CreatedAt);
        teacher.UpdatedAt.Should().Be(entity.UpdatedAt);
    }

    #endregion
}
