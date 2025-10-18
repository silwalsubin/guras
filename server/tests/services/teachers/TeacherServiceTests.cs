using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using services.teachers.Domain;
using services.teachers.Repositories;
using services.teachers.Services;
using Xunit;

namespace tests;

public class TeacherServiceTests
{
    private readonly Mock<ITeacherRepository> _mockRepository;
    private readonly Mock<ILogger<TeacherService>> _mockLogger;
    private readonly TeacherService _teacherService;

    public TeacherServiceTests()
    {
        _mockRepository = new Mock<ITeacherRepository>();
        _mockLogger = new Mock<ILogger<TeacherService>>();
        _teacherService = new TeacherService(_mockRepository.Object, _mockLogger.Object);
    }

    #region GetAllTeachersAsync Tests

    [Fact]
    public async Task GetAllTeachersAsync_ShouldReturnAllTeachers_WhenTeachersExist()
    {
        // Arrange
        var teachers = new List<Teacher>
        {
            CreateSampleTeacher("Osho", "Osho Rajneesh"),
            CreateSampleTeacher("Buddha", "Siddhartha Gautama")
        };

        _mockRepository.Setup(r => r.GetAllTeachersAsync())
            .ReturnsAsync(teachers);

        // Act
        var result = await _teacherService.GetAllTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().Contain(t => t.Name == "Osho");
        result.Should().Contain(t => t.Name == "Buddha");
        _mockRepository.Verify(r => r.GetAllTeachersAsync(), Times.Once);
    }

    [Fact]
    public async Task GetAllTeachersAsync_ShouldReturnEmptyList_WhenNoTeachersExist()
    {
        // Arrange
        _mockRepository.Setup(r => r.GetAllTeachersAsync())
            .ReturnsAsync(new List<Teacher>());

        // Act
        var result = await _teacherService.GetAllTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEmpty();
        _mockRepository.Verify(r => r.GetAllTeachersAsync(), Times.Once);
    }

    #endregion

    #region GetActiveTeachersAsync Tests

    [Fact]
    public async Task GetActiveTeachersAsync_ShouldReturnOnlyActiveTeachers_WhenActiveTeachersExist()
    {
        // Arrange
        var activeTeachers = new List<Teacher>
        {
            CreateSampleTeacher("Osho", "Osho Rajneesh", isActive: true),
            CreateSampleTeacher("Buddha", "Siddhartha Gautama", isActive: true)
        };

        _mockRepository.Setup(r => r.GetActiveTeachersAsync())
            .ReturnsAsync(activeTeachers);

        // Act
        var result = await _teacherService.GetActiveTeachersAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.IsActive);
        _mockRepository.Verify(r => r.GetActiveTeachersAsync(), Times.Once);
    }

    #endregion

    #region GetTeacherByIdAsync Tests

    [Fact]
    public async Task GetTeacherByIdAsync_ShouldReturnTeacher_WhenTeacherExists()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        var teacher = CreateSampleTeacher("Osho", "Osho Rajneesh", teacherId);

        _mockRepository.Setup(r => r.GetTeacherByIdAsync(teacherId))
            .ReturnsAsync(teacher);

        // Act
        var result = await _teacherService.GetTeacherByIdAsync(teacherId);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be("Osho");
        result.DisplayName.Should().Be("Osho Rajneesh");
        _mockRepository.Verify(r => r.GetTeacherByIdAsync(teacherId), Times.Once);
    }

    [Fact]
    public async Task GetTeacherByIdAsync_ShouldReturnNull_WhenTeacherDoesNotExist()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        _mockRepository.Setup(r => r.GetTeacherByIdAsync(teacherId))
            .ReturnsAsync((Teacher?)null);

        // Act
        var result = await _teacherService.GetTeacherByIdAsync(teacherId);

        // Assert
        result.Should().BeNull();
        _mockRepository.Verify(r => r.GetTeacherByIdAsync(teacherId), Times.Once);
    }

    #endregion

    #region GetTeacherByNameAsync Tests

    [Fact]
    public async Task GetTeacherByNameAsync_ShouldReturnTeacher_WhenTeacherExists()
    {
        // Arrange
        var teacherName = "Osho";
        var teacher = CreateSampleTeacher(teacherName, "Osho Rajneesh");

        _mockRepository.Setup(r => r.GetTeacherByNameAsync(teacherName))
            .ReturnsAsync(teacher);

        // Act
        var result = await _teacherService.GetTeacherByNameAsync(teacherName);

        // Assert
        result.Should().NotBeNull();
        result!.Name.Should().Be(teacherName);
        _mockRepository.Verify(r => r.GetTeacherByNameAsync(teacherName), Times.Once);
    }

    [Fact]
    public async Task GetTeacherByNameAsync_ShouldReturnNull_WhenTeacherDoesNotExist()
    {
        // Arrange
        var teacherName = "NonExistentTeacher";
        _mockRepository.Setup(r => r.GetTeacherByNameAsync(teacherName))
            .ReturnsAsync((Teacher?)null);

        // Act
        var result = await _teacherService.GetTeacherByNameAsync(teacherName);

        // Assert
        result.Should().BeNull();
        _mockRepository.Verify(r => r.GetTeacherByNameAsync(teacherName), Times.Once);
    }

    #endregion

    #region CreateTeacherAsync Tests

    [Fact]
    public async Task CreateTeacherAsync_ShouldCreateTeacher_WhenValidRequest()
    {
        // Arrange
        var request = new CreateTeacherRequest
        {
            Name = "Osho",
            DisplayName = "Osho Rajneesh",
            FullName = "Bhagwan Shree Rajneesh",
            Description = "Spiritual teacher and philosopher",
            CoreTeachings = new List<string> { "Meditation", "Consciousness" },
            TeachingApproach = "Direct",
            TeachingTone = "Provocative",
            TeachingFocus = "Self-realization",
            TeachingComplexity = "Advanced"
        };

        var createdTeacher = CreateSampleTeacher("Osho", "Osho Rajneesh");
        _mockRepository.Setup(r => r.CreateTeacherAsync(It.IsAny<Teacher>()))
            .ReturnsAsync(createdTeacher);

        // Act
        var result = await _teacherService.CreateTeacherAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be("Osho");
        result.DisplayName.Should().Be("Osho Rajneesh");
        _mockRepository.Verify(r => r.CreateTeacherAsync(It.IsAny<Teacher>()), Times.Once);
    }

    [Fact]
    public async Task CreateTeacherAsync_ShouldThrowException_WhenRepositoryThrows()
    {
        // Arrange
        var request = new CreateTeacherRequest
        {
            Name = "Osho",
            DisplayName = "Osho Rajneesh"
        };

        _mockRepository.Setup(r => r.CreateTeacherAsync(It.IsAny<Teacher>()))
            .ThrowsAsync(new Exception("Database error"));

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _teacherService.CreateTeacherAsync(request));
        _mockRepository.Verify(r => r.CreateTeacherAsync(It.IsAny<Teacher>()), Times.Once);
    }

    #endregion

    #region UpdateTeacherAsync Tests

    [Fact]
    public async Task UpdateTeacherAsync_ShouldUpdateTeacher_WhenTeacherExists()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        var request = new UpdateTeacherRequest
        {
            DisplayName = "Updated Osho",
            Description = "Updated description"
        };

        var existingTeacher = CreateSampleTeacher("Osho", "Osho Rajneesh", teacherId);
        var updatedTeacher = CreateSampleTeacher("Osho", "Updated Osho", teacherId);
        
        _mockRepository.Setup(r => r.GetTeacherByIdAsync(teacherId))
            .ReturnsAsync(existingTeacher);
        _mockRepository.Setup(r => r.UpdateTeacherAsync(teacherId, It.IsAny<Teacher>()))
            .ReturnsAsync(updatedTeacher);

        // Act
        var result = await _teacherService.UpdateTeacherAsync(teacherId, request);

        // Assert
        result.Should().NotBeNull();
        result!.DisplayName.Should().Be("Updated Osho");
        _mockRepository.Verify(r => r.GetTeacherByIdAsync(teacherId), Times.Once);
        _mockRepository.Verify(r => r.UpdateTeacherAsync(teacherId, It.IsAny<Teacher>()), Times.Once);
    }

    [Fact]
    public async Task UpdateTeacherAsync_ShouldReturnNull_WhenTeacherDoesNotExist()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        var request = new UpdateTeacherRequest
        {
            DisplayName = "Updated Osho"
        };

        _mockRepository.Setup(r => r.GetTeacherByIdAsync(teacherId))
            .ReturnsAsync((Teacher?)null);

        // Act
        var result = await _teacherService.UpdateTeacherAsync(teacherId, request);

        // Assert
        result.Should().BeNull();
        _mockRepository.Verify(r => r.GetTeacherByIdAsync(teacherId), Times.Once);
        _mockRepository.Verify(r => r.UpdateTeacherAsync(It.IsAny<Guid>(), It.IsAny<Teacher>()), Times.Never);
    }

    #endregion

    #region DeleteTeacherAsync Tests

    [Fact]
    public async Task DeleteTeacherAsync_ShouldReturnTrue_WhenTeacherExists()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        _mockRepository.Setup(r => r.DeleteTeacherAsync(teacherId))
            .ReturnsAsync(true);

        // Act
        var result = await _teacherService.DeleteTeacherAsync(teacherId);

        // Assert
        result.Should().BeTrue();
        _mockRepository.Verify(r => r.DeleteTeacherAsync(teacherId), Times.Once);
    }

    [Fact]
    public async Task DeleteTeacherAsync_ShouldReturnFalse_WhenTeacherDoesNotExist()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        _mockRepository.Setup(r => r.DeleteTeacherAsync(teacherId))
            .ReturnsAsync(false);

        // Act
        var result = await _teacherService.DeleteTeacherAsync(teacherId);

        // Assert
        result.Should().BeFalse();
        _mockRepository.Verify(r => r.DeleteTeacherAsync(teacherId), Times.Once);
    }

    #endregion

    #region DeactivateTeacherAsync Tests

    [Fact]
    public async Task DeactivateTeacherAsync_ShouldReturnTrue_WhenTeacherExists()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        _mockRepository.Setup(r => r.DeactivateTeacherAsync(teacherId))
            .ReturnsAsync(true);

        // Act
        var result = await _teacherService.DeactivateTeacherAsync(teacherId);

        // Assert
        result.Should().BeTrue();
        _mockRepository.Verify(r => r.DeactivateTeacherAsync(teacherId), Times.Once);
    }

    [Fact]
    public async Task DeactivateTeacherAsync_ShouldReturnFalse_WhenTeacherDoesNotExist()
    {
        // Arrange
        var teacherId = Guid.NewGuid();
        _mockRepository.Setup(r => r.DeactivateTeacherAsync(teacherId))
            .ReturnsAsync(false);

        // Act
        var result = await _teacherService.DeactivateTeacherAsync(teacherId);

        // Assert
        result.Should().BeFalse();
        _mockRepository.Verify(r => r.DeactivateTeacherAsync(teacherId), Times.Once);
    }

    #endregion

    #region GetTeachersByFocusAsync Tests

    [Fact]
    public async Task GetTeachersByFocusAsync_ShouldReturnTeachers_WhenTeachersWithFocusExist()
    {
        // Arrange
        var focus = "Meditation";
        var teachers = new List<Teacher>
        {
            CreateSampleTeacher("Osho", "Osho Rajneesh", teachingFocus: focus),
            CreateSampleTeacher("Buddha", "Siddhartha Gautama", teachingFocus: focus)
        };

        _mockRepository.Setup(r => r.GetTeachersByFocusAsync(focus))
            .ReturnsAsync(teachers);

        // Act
        var result = await _teacherService.GetTeachersByFocusAsync(focus);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.TeachingFocus == focus);
        _mockRepository.Verify(r => r.GetTeachersByFocusAsync(focus), Times.Once);
    }

    #endregion

    #region GetTeachersByComplexityAsync Tests

    [Fact]
    public async Task GetTeachersByComplexityAsync_ShouldReturnTeachers_WhenTeachersWithComplexityExist()
    {
        // Arrange
        var complexity = "Beginner";
        var teachers = new List<Teacher>
        {
            CreateSampleTeacher("Osho", "Osho Rajneesh", teachingComplexity: complexity),
            CreateSampleTeacher("Buddha", "Siddhartha Gautama", teachingComplexity: complexity)
        };

        _mockRepository.Setup(r => r.GetTeachersByComplexityAsync(complexity))
            .ReturnsAsync(teachers);

        // Act
        var result = await _teacherService.GetTeachersByComplexityAsync(complexity);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().OnlyContain(t => t.TeachingComplexity == complexity);
        _mockRepository.Verify(r => r.GetTeachersByComplexityAsync(complexity), Times.Once);
    }

    #endregion

    #region Helper Methods

    private static Teacher CreateSampleTeacher(
        string name, 
        string displayName, 
        Guid? id = null, 
        bool isActive = true,
        string? teachingFocus = "Meditation",
        string? teachingComplexity = "Intermediate")
    {
        return new Teacher
        {
            Id = id ?? Guid.NewGuid(),
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
}
