using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using services.teachers.Data;
using services.teachers.Domain;
using services.teachers.Models;
using services.teachers.Repositories;
using Xunit;

namespace tests;

public class TeacherRepositoryTests : IDisposable
{
    private readonly TeachersDbContext _context;
    private readonly TeacherRepository _repository;
    private readonly Mock<ILogger<TeacherRepository>> _mockLogger;

    public TeacherRepositoryTests()
    {
        var options = new DbContextOptionsBuilder<TeachersDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        _context = new TeachersDbContext(options);
        _mockLogger = new Mock<ILogger<TeacherRepository>>();
        _repository = new TeacherRepository(_context, _mockLogger.Object);
    }

    #region GetAllTeachersAsync Tests

    [Fact]
    public async Task GetAllTeachersAsync_ShouldReturnAllTeachers_WhenTeachersExist()
    {
        // Arrange
        var teachers = new List<TeacherEntity>
        {
            CreateSampleTeacherEntity("Osho", "Osho Rajneesh"),
            CreateSampleTeacherEntity("Buddha", "Siddhartha Gautama"),
            CreateSampleTeacherEntity("Krishnamurti", "J. Krishnamurti", isActive: false)
        };

        _context.Teachers.AddRange(teachers);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.Should().Contain(t => t.Name == "Osho");
        result.Should().Contain(t => t.Name == "Buddha");
        result.Should().Contain(t => t.Name == "Krishnamurti");
    }

    [Fact]
    public async Task GetAllTeachersAsync_ShouldReturnEmptyList_WhenNoTeachersExist()
    {
        // Act
        var result = await _repository.GetAllTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
    }

    [Fact]
    public async Task GetAllTeachersAsync_ShouldOrderByName_WhenMultipleTeachersExist()
    {
        // Arrange
        var teachers = new List<TeacherEntity>
        {
            CreateSampleTeacherEntity("Zoroaster", "Zoroaster"),
            CreateSampleTeacherEntity("Buddha", "Siddhartha Gautama"),
            CreateSampleTeacherEntity("Osho", "Osho Rajneesh")
        };

        _context.Teachers.AddRange(teachers);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetAllTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        var resultList = result.ToList();
        resultList[0].DisplayName.Should().Be("Osho Rajneesh");
        resultList[1].DisplayName.Should().Be("Siddhartha Gautama");
        resultList[2].DisplayName.Should().Be("Zoroaster");
    }

    #endregion

    #region GetActiveTeachersAsync Tests

    [Fact]
    public async Task GetActiveTeachersAsync_ShouldReturnOnlyActiveTeachers_WhenActiveTeachersExist()
    {
        // Arrange
        var teachers = new List<TeacherEntity>
        {
            CreateSampleTeacherEntity("Osho", "Osho Rajneesh", isActive: true),
            CreateSampleTeacherEntity("Buddha", "Siddhartha Gautama", isActive: true),
            CreateSampleTeacherEntity("Krishnamurti", "J. Krishnamurti", isActive: false)
        };

        _context.Teachers.AddRange(teachers);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetActiveTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.IsActive);
        result.Should().Contain(t => t.Name == "Osho");
        result.Should().Contain(t => t.Name == "Buddha");
    }

    #endregion

    #region GetTeacherByIdAsync Tests

    [Fact]
    public async Task GetTeacherByIdAsync_ShouldReturnTeacher_WhenTeacherExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh");
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTeacherByIdAsync(teacher.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Osho");
        result.DisplayName.Should().Be("Osho Rajneesh");
    }

    [Fact]
    public async Task GetTeacherByIdAsync_ShouldReturnNull_WhenTeacherDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.GetTeacherByIdAsync(nonExistentId);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region GetTeacherByNameAsync Tests

    [Fact]
    public async Task GetTeacherByNameAsync_ShouldReturnTeacher_WhenTeacherExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh");
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTeacherByNameAsync("Osho");

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Osho");
        result.DisplayName.Should().Be("Osho Rajneesh");
    }

    [Fact]
    public async Task GetTeacherByNameAsync_ShouldReturnNull_WhenTeacherDoesNotExist()
    {
        // Act
        var result = await _repository.GetTeacherByNameAsync("NonExistentTeacher");

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region CreateTeacherAsync Tests

    [Fact]
    public async Task CreateTeacherAsync_ShouldCreateTeacher_WhenValidTeacher()
    {
        // Arrange
        var teacher = new Teacher
        {
            Name = "Osho",
            DisplayName = "Osho Rajneesh",
            FullName = "Bhagwan Shree Rajneesh",
            Description = "Spiritual teacher and philosopher",
            CoreTeachings = new List<string> { "Meditation", "Consciousness" },
            TeachingApproach = "Direct",
            TeachingTone = "Provocative",
            TeachingFocus = "Self-realization",
            TeachingComplexity = "Advanced",
            PersonalityTraits = new List<string> { "Wise", "Compassionate" },
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.CreateTeacherAsync(teacher);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Osho");
        result.DisplayName.Should().Be("Osho Rajneesh");
        result.Id.Should().NotBeEmpty();
        result.CreatedAt.Should().NotBe(default(DateTime));
        result.UpdatedAt.Should().NotBe(default(DateTime));

        // Verify it was saved to database
        var savedTeacher = await _context.Teachers.FindAsync(result.Id);
        savedTeacher.Should().NotBeNull();
        savedTeacher!.Name.Should().Be("Osho");
    }

    #endregion

    #region UpdateTeacherAsync Tests

    [Fact]
    public async Task UpdateTeacherAsync_ShouldUpdateTeacher_WhenTeacherExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh");
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        var updatedTeacher = new Teacher
        {
            Id = teacher.Id,
            Name = "Osho",
            DisplayName = "Updated Osho",
            FullName = "Updated Full Name",
            Description = "Updated description",
            CoreTeachings = new List<string> { "Updated Teaching" },
            TeachingApproach = "Updated Approach",
            TeachingTone = "Updated Tone",
            TeachingFocus = "Updated Focus",
            TeachingComplexity = "Updated Complexity",
            PersonalityTraits = new List<string> { "Updated Trait" },
            IsActive = true,
            CreatedAt = teacher.CreatedAt,
            UpdatedAt = DateTime.UtcNow
        };

        // Act
        var result = await _repository.UpdateTeacherAsync(teacher.Id, updatedTeacher);

        // Assert
        result.Should().NotBeNull();
        result!.DisplayName.Should().Be("Updated Osho");
        result.FullName.Should().Be("Updated Full Name");
        result.UpdatedAt.Should().NotBe(default(DateTime));

        // Verify it was updated in database
        var savedTeacher = await _context.Teachers.FindAsync(teacher.Id);
        savedTeacher.Should().NotBeNull();
        savedTeacher!.DisplayName.Should().Be("Updated Osho");
    }

    [Fact]
    public async Task UpdateTeacherAsync_ShouldReturnNull_WhenTeacherDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();
        var updatedTeacher = new Teacher
        {
            Id = nonExistentId,
            Name = "NonExistent",
            DisplayName = "NonExistent Teacher"
        };

        // Act
        var result = await _repository.UpdateTeacherAsync(nonExistentId, updatedTeacher);

        // Assert
        result.Should().BeNull();
    }

    #endregion

    #region DeleteTeacherAsync Tests

    [Fact]
    public async Task DeleteTeacherAsync_ShouldReturnTrue_WhenTeacherExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh");
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeleteTeacherAsync(teacher.Id);

        // Assert
        result.Should().BeTrue();

        // Verify it was deleted from database
        var deletedTeacher = await _context.Teachers.FindAsync(teacher.Id);
        deletedTeacher.Should().BeNull();
    }

    [Fact]
    public async Task DeleteTeacherAsync_ShouldReturnFalse_WhenTeacherDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.DeleteTeacherAsync(nonExistentId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region DeactivateTeacherAsync Tests

    [Fact]
    public async Task DeactivateTeacherAsync_ShouldReturnTrue_WhenTeacherExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh", isActive: true);
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.DeactivateTeacherAsync(teacher.Id);

        // Assert
        result.Should().BeTrue();

        // Verify it was deactivated in database
        var deactivatedTeacher = await _context.Teachers.FindAsync(teacher.Id);
        deactivatedTeacher.Should().NotBeNull();
        deactivatedTeacher!.IsActive.Should().BeFalse();
    }

    [Fact]
    public async Task DeactivateTeacherAsync_ShouldReturnFalse_WhenTeacherDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.DeactivateTeacherAsync(nonExistentId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region GetTeachersByFocusAsync Tests

    [Fact]
    public async Task GetTeachersByFocusAsync_ShouldReturnTeachers_WhenTeachersWithFocusExist()
    {
        // Arrange
        var focus = "Meditation";
        var teachers = new List<TeacherEntity>
        {
            CreateSampleTeacherEntity("Osho", "Osho Rajneesh", teachingFocus: focus),
            CreateSampleTeacherEntity("Buddha", "Siddhartha Gautama", teachingFocus: focus),
            CreateSampleTeacherEntity("Krishnamurti", "J. Krishnamurti", teachingFocus: "Philosophy")
        };

        _context.Teachers.AddRange(teachers);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTeachersByFocusAsync(focus);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.TeachingFocus == focus);
        result.Should().Contain(t => t.Name == "Osho");
        result.Should().Contain(t => t.Name == "Buddha");
    }

    #endregion

    #region GetTeachersByComplexityAsync Tests

    [Fact]
    public async Task GetTeachersByComplexityAsync_ShouldReturnTeachers_WhenTeachersWithComplexityExist()
    {
        // Arrange
        var complexity = "Beginner";
        var teachers = new List<TeacherEntity>
        {
            CreateSampleTeacherEntity("Osho", "Osho Rajneesh", teachingComplexity: complexity),
            CreateSampleTeacherEntity("Buddha", "Siddhartha Gautama", teachingComplexity: complexity),
            CreateSampleTeacherEntity("Krishnamurti", "J. Krishnamurti", teachingComplexity: "Advanced")
        };

        _context.Teachers.AddRange(teachers);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.GetTeachersByComplexityAsync(complexity);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.TeachingComplexity == complexity);
        result.Should().Contain(t => t.Name == "Osho");
        result.Should().Contain(t => t.Name == "Buddha");
    }

    #endregion

    #region TeacherExistsAsync Tests

    [Fact]
    public async Task TeacherExistsAsync_ShouldReturnTrue_WhenTeacherExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh");
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.TeacherExistsAsync(teacher.Id);

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TeacherExistsAsync_ShouldReturnFalse_WhenTeacherDoesNotExist()
    {
        // Arrange
        var nonExistentId = Guid.NewGuid();

        // Act
        var result = await _repository.TeacherExistsAsync(nonExistentId);

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region TeacherNameExistsAsync Tests

    [Fact]
    public async Task TeacherNameExistsAsync_ShouldReturnTrue_WhenTeacherNameExists()
    {
        // Arrange
        var teacher = CreateSampleTeacherEntity("Osho", "Osho Rajneesh");
        _context.Teachers.Add(teacher);
        await _context.SaveChangesAsync();

        // Act
        var result = await _repository.TeacherNameExistsAsync("Osho");

        // Assert
        result.Should().BeTrue();
    }

    [Fact]
    public async Task TeacherNameExistsAsync_ShouldReturnFalse_WhenTeacherNameDoesNotExist()
    {
        // Act
        var result = await _repository.TeacherNameExistsAsync("NonExistentTeacher");

        // Assert
        result.Should().BeFalse();
    }

    #endregion

    #region Helper Methods

    private static TeacherEntity CreateSampleTeacherEntity(
        string name,
        string displayName,
        bool isActive = true,
        string? teachingFocus = "Meditation",
        string? teachingComplexity = "Intermediate")
    {
        return new TeacherEntity
        {
            Id = Guid.NewGuid(),
            Name = name,
            DisplayName = displayName,
            FullName = displayName,
            Description = $"Description for {name}",
            CoreTeachings = new List<string> { "Meditation", "Consciousness" },
            TeachingApproach = "Direct",
            TeachingTone = "Compassionate",
            TeachingFocus = teachingFocus,
            TeachingComplexity = teachingComplexity,
            PersonalityTraits = new List<string> { "Wise", "Compassionate" },
            IsActive = isActive,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    #endregion

    public void Dispose()
    {
        _context.Dispose();
    }
}
