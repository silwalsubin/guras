using FluentAssertions;
using Microsoft.Extensions.Logging;
using Moq;
using services.users.Domain;
using services.users.Repositories;
using services.users.Services;
using Xunit;

namespace tests;

public class UserServiceTests
{
    private readonly Mock<IUserRepository> _mockUserRepository;
    private readonly Mock<ILogger<UserService>> _mockLogger;
    private readonly UserService _userService;

    public UserServiceTests()
    {
        _mockUserRepository = new Mock<IUserRepository>();
        _mockLogger = new Mock<ILogger<UserService>>();
        _userService = new UserService(_mockUserRepository.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GetUserByIdAsync_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var expectedUser = new User
        {
            UserId = userId,
            Email = "test@example.com",
            Name = "Test User",
            FireBaseUserId = "firebase123",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _userService.GetUserByIdAsync(userId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedUser);
        _mockUserRepository.Verify(r => r.GetByUserIdAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetUserByIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.GetUserByIdAsync(userId);

        // Assert
        result.Should().BeNull();
        _mockUserRepository.Verify(r => r.GetByUserIdAsync(userId), Times.Once);
    }

    [Fact]
    public async Task GetUserByEmailAsync_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var email = "test@example.com";
        var expectedUser = new User
        {
            UserId = Guid.NewGuid(),
            Email = email,
            Name = "Test User",
            FireBaseUserId = "firebase123",
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByEmailAsync(email))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _userService.GetUserByEmailAsync(email);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedUser);
        _mockUserRepository.Verify(r => r.GetByEmailAsync(email), Times.Once);
    }

    [Fact]
    public async Task GetUserByFireBaseUserId_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var firebaseUserId = "firebase123";
        var expectedUser = new User
        {
            UserId = Guid.NewGuid(),
            Email = "test@example.com",
            Name = "Test User",
            FireBaseUserId = firebaseUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _mockUserRepository.Setup(r => r.GetByFirebaseUidAsync(firebaseUserId))
            .ReturnsAsync(expectedUser);

        // Act
        var result = await _userService.GetUserByFireBaseUserId(firebaseUserId);

        // Assert
        result.Should().NotBeNull();
        result.Should().BeEquivalentTo(expectedUser);
        _mockUserRepository.Verify(r => r.GetByFirebaseUidAsync(firebaseUserId), Times.Once);
    }

    [Fact]
    public async Task CreateUserAsync_ShouldCreateUser_WhenValidPayloadProvided()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = "newuser@example.com",
            Name = "New User",
            FireBaseUserId = "firebase456"
        };

        _mockUserRepository.Setup(r => r.GetByEmailAsync(payload.Email!))
            .ReturnsAsync((User?)null);

        _mockUserRepository.Setup(r => r.CreateAsync(It.IsAny<User>()))
            .Returns(Task.CompletedTask);

        // Act
        var result = await _userService.CreateUserAsync(payload);

        // Assert
        result.Should().NotBeEmpty();
        _mockUserRepository.Verify(r => r.GetByEmailAsync(payload.Email!), Times.Once);
        _mockUserRepository.Verify(r => r.CreateAsync(It.Is<User>(u =>
            u.Email == payload.Email &&
            u.Name == payload.Name &&
            u.FireBaseUserId == payload.FireBaseUserId &&
            u.UserId != Guid.Empty &&
            u.CreatedAt > DateTime.UtcNow.AddMinutes(-1) &&
            u.UpdatedAt > DateTime.UtcNow.AddMinutes(-1)
        )), Times.Once);
    }

    [Fact]
    public async Task CreateUserAsync_ShouldThrowException_WhenUserAlreadyExists()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = "existing@example.com",
            Name = "Existing User",
            FireBaseUserId = "firebase789"
        };

        var existingUser = new User
        {
            UserId = Guid.NewGuid(),
            Email = payload.Email,
            Name = "Existing User",
            FireBaseUserId = "oldfirebase",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockUserRepository.Setup(r => r.GetByEmailAsync(payload.Email!))
            .ReturnsAsync(existingUser);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.CreateUserAsync(payload));

        exception.Message.Should().Contain($"User with email {payload.Email} already exists");
        _mockUserRepository.Verify(r => r.GetByEmailAsync(payload.Email!), Times.Once);
        _mockUserRepository.Verify(r => r.CreateAsync(It.IsAny<User>()), Times.Never);
    }

    [Theory]
    [InlineData("", "Test User", "firebase123")]
    [InlineData("test@example.com", "Test User", "")]
    public async Task CreateUserAsync_ShouldThrowException_WhenInvalidPayloadProvided(string email, string name, string firebaseUserId)
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = email,
            Name = name,
            FireBaseUserId = firebaseUserId
        };

        // Act & Assert
        // Expect either ArgumentException or ArgumentNullException
        var exception = await Assert.ThrowsAnyAsync<ArgumentException>(
            () => _userService.CreateUserAsync(payload));

        // Both exception types should contain validation-related messages
        exception.Message.Should().MatchRegex("(Required input|Value cannot be null)");
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldUpdateUser_WhenValidPayloadProvided()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var payload = new UpdateUserPayload
        {
            UserId = userId,
            Email = "updated@example.com",
            Name = "Updated User",
            FireBaseUserId = "newfirebase123"
        };

        var existingUser = new User
        {
            UserId = userId,
            Email = "old@example.com",
            Name = "Old User",
            FireBaseUserId = "oldfirebase",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync(existingUser);

        _mockUserRepository.Setup(r => r.UpdateAsync(It.IsAny<User>()))
            .ReturnsAsync(existingUser);

        // Act
        await _userService.UpdateUserAsync(payload);

        // Assert
        _mockUserRepository.Verify(r => r.GetByUserIdAsync(userId), Times.Once);
        _mockUserRepository.Verify(r => r.UpdateAsync(It.Is<User>(u =>
            u.UserId == userId &&
            u.Email == payload.Email &&
            u.Name == payload.Name &&
            u.FireBaseUserId == payload.FireBaseUserId &&
            u.UpdatedAt > DateTime.UtcNow.AddMinutes(-1)
        )), Times.Once);
    }

    [Fact]
    public async Task UpdateUserAsync_ShouldThrowException_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var payload = new UpdateUserPayload
        {
            UserId = userId,
            Email = "updated@example.com",
            Name = "Updated User",
            FireBaseUserId = "newfirebase123"
        };

        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.UpdateUserAsync(payload));

        exception.Message.Should().Contain($"User with ID {userId} not found");
        _mockUserRepository.Verify(r => r.GetByUserIdAsync(userId), Times.Once);
        _mockUserRepository.Verify(r => r.UpdateAsync(It.IsAny<User>()), Times.Never);
    }

    [Theory]
    [InlineData("")]
    public async Task UpdateUserAsync_ShouldThrowException_WhenInvalidEmailProvided(string email)
    {
        // Arrange
        var userId = Guid.NewGuid();
        var payload = new UpdateUserPayload
        {
            UserId = userId,
            Email = email,
            Name = "Updated User",
            FireBaseUserId = "newfirebase123"
        };

        var existingUser = new User
        {
            UserId = userId,
            Email = "old@example.com",
            Name = "Old User",
            FireBaseUserId = "oldfirebase",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync(existingUser);

        // Act & Assert
        // Expect either ArgumentException or ArgumentNullException
        var exception = await Assert.ThrowsAnyAsync<ArgumentException>(
            () => _userService.UpdateUserAsync(payload));

        // Both exception types should contain validation-related messages
        exception.Message.Should().MatchRegex("(Required input|Value cannot be null)");
    }

    [Fact]
    public async Task UserExistsAsync_ShouldReturnTrue_WhenUserExists()
    {
        // Arrange
        var email = "existing@example.com";
        _mockUserRepository.Setup(r => r.ExistsAsync(email))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.UserExistsAsync(email);

        // Assert
        result.Should().BeTrue();
        _mockUserRepository.Verify(r => r.ExistsAsync(email), Times.Once);
    }

    [Fact]
    public async Task UserExistsAsync_ShouldReturnFalse_WhenUserDoesNotExist()
    {
        // Arrange
        var email = "nonexistent@example.com";
        _mockUserRepository.Setup(r => r.ExistsAsync(email))
            .ReturnsAsync(false);

        // Act
        var result = await _userService.UserExistsAsync(email);

        // Assert
        result.Should().BeFalse();
        _mockUserRepository.Verify(r => r.ExistsAsync(email), Times.Once);
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldReturnTrue_WhenUserExistsAndDeleted()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var existingUser = new User
        {
            UserId = userId,
            Email = "test@example.com",
            Name = "Test User",
            FireBaseUserId = "firebase123",
            CreatedAt = DateTime.UtcNow.AddDays(-1),
            UpdatedAt = DateTime.UtcNow.AddDays(-1)
        };

        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync(existingUser);

        _mockUserRepository.Setup(r => r.DeleteAsync(userId))
            .ReturnsAsync(true);

        // Act
        var result = await _userService.DeleteUserAsync(userId);

        // Assert
        result.Should().BeTrue();
        _mockUserRepository.Verify(r => r.GetByUserIdAsync(userId), Times.Once);
        _mockUserRepository.Verify(r => r.DeleteAsync(userId), Times.Once);
    }

    [Fact]
    public async Task DeleteUserAsync_ShouldReturnFalse_WhenUserDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        _mockUserRepository.Setup(r => r.GetByUserIdAsync(userId))
            .ReturnsAsync((User?)null);

        // Act
        var result = await _userService.DeleteUserAsync(userId);

        // Assert
        result.Should().BeFalse();
        _mockUserRepository.Verify(r => r.GetByUserIdAsync(userId), Times.Once);
        _mockUserRepository.Verify(r => r.DeleteAsync(userId), Times.Never);
    }
}
