using FluentAssertions;
using services.users.Domain;
using services.users.Services;
using Xunit;

namespace tests.services.users;

public class UserServiceIntegrationTests
{
    private readonly IUserService _userService;

    public UserServiceIntegrationTests()
    {
        _userService = TestServiceProvider.GetService<IUserService>();
    }

    [Fact]
    public async Task CreateUser_ShouldCreateUserInDatabase_WhenValidPayloadProvided()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = $"test-{Guid.NewGuid()}@example.com",
            Name = "Integration Test User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        // Act
        var userId = await _userService.CreateUserAsync(payload);

        // Assert
        userId.Should().NotBeEmpty();

        // Verify user was actually created in database
        var createdUser = await _userService.GetUserByIdAsync(userId);
        createdUser.Should().NotBeNull();
        createdUser!.Email.Should().Be(payload.Email);
        createdUser.Name.Should().Be(payload.Name);
        createdUser.FireBaseUserId.Should().Be(payload.FireBaseUserId);
        createdUser.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));
        createdUser.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));

        // Cleanup
        await _userService.DeleteUserAsync(userId);
    }

    [Fact]
    public async Task CreateUser_ShouldThrowException_WhenUserWithSameEmailExists()
    {
        // Arrange
        var email = $"duplicate-{Guid.NewGuid()}@example.com";
        var payload1 = new CreateNewUserPayload
        {
            Email = email,
            Name = "First User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        var payload2 = new CreateNewUserPayload
        {
            Email = email,
            Name = "Second User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        // Create first user
        var userId1 = await _userService.CreateUserAsync(payload1);

        // Act & Assert - Second user should fail
        var exception = await Assert.ThrowsAsync<InvalidOperationException>(
            () => _userService.CreateUserAsync(payload2));

        exception.Message.Should().Contain($"User with email {email} already exists");

        // Cleanup
        await _userService.DeleteUserAsync(userId1);
    }

    [Fact]
    public async Task UpdateUser_ShouldUpdateUserInDatabase_WhenValidPayloadProvided()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = $"update-test-{Guid.NewGuid()}@example.com",
            Name = "Original Name",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        var userId = await _userService.CreateUserAsync(payload);

        var updatePayload = new UpdateUserPayload
        {
            UserId = userId,
            Email = $"updated-{Guid.NewGuid()}@example.com",
            Name = "Updated Name",
            FireBaseUserId = $"updated-firebase-{Guid.NewGuid()}"
        };

        // Act
        await _userService.UpdateUserAsync(updatePayload);

        // Assert
        var updatedUser = await _userService.GetUserByIdAsync(userId);
        updatedUser.Should().NotBeNull();
        updatedUser!.Email.Should().Be(updatePayload.Email);
        updatedUser.Name.Should().Be(updatePayload.Name);
        updatedUser.FireBaseUserId.Should().Be(updatePayload.FireBaseUserId);
        updatedUser.UpdatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromMinutes(1));

        // Cleanup
        await _userService.DeleteUserAsync(userId);
    }

    [Fact]
    public async Task DeleteUser_ShouldRemoveUserFromDatabase_WhenUserExists()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = $"delete-test-{Guid.NewGuid()}@example.com",
            Name = "Delete Test User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        var userId = await _userService.CreateUserAsync(payload);

        // Verify user exists
        var existingUser = await _userService.GetUserByIdAsync(userId);
        existingUser.Should().NotBeNull();

        // Act
        var deleteResult = await _userService.DeleteUserAsync(userId);

        // Assert
        deleteResult.Should().BeTrue();

        // Verify user no longer exists
        var deletedUser = await _userService.GetUserByIdAsync(userId);
        deletedUser.Should().BeNull();
    }

    [Fact]
    public async Task GetUserByEmail_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = $"email-search-{Guid.NewGuid()}@example.com",
            Name = "Email Search User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        var userId = await _userService.CreateUserAsync(payload);

        // Act
        var foundUser = await _userService.GetUserByEmailAsync(payload.Email!);

        // Assert
        foundUser.Should().NotBeNull();
        foundUser!.UserId.Should().Be(userId);
        foundUser.Email.Should().Be(payload.Email);
        foundUser.Name.Should().Be(payload.Name);
        foundUser.FireBaseUserId.Should().Be(payload.FireBaseUserId);

        // Cleanup
        await _userService.DeleteUserAsync(userId);
    }

    [Fact]
    public async Task GetUserByFirebaseUid_ShouldReturnUser_WhenUserExists()
    {
        // Arrange
        var payload = new CreateNewUserPayload
        {
            Email = $"firebase-search-{Guid.NewGuid()}@example.com",
            Name = "Firebase Search User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        var userId = await _userService.CreateUserAsync(payload);

        // Act
        var foundUser = await _userService.GetUserByFireBaseUserId(payload.FireBaseUserId!);

        // Assert
        foundUser.Should().NotBeNull();
        foundUser!.UserId.Should().Be(userId);
        foundUser.Email.Should().Be(payload.Email);
        foundUser.Name.Should().Be(payload.Name);
        foundUser.FireBaseUserId.Should().Be(payload.FireBaseUserId);

        // Cleanup
        await _userService.DeleteUserAsync(userId);
    }

    [Fact]
    public async Task UserExists_ShouldReturnCorrectBoolean_WhenCheckingExistence()
    {
        // Arrange
        var email = $"existence-test-{Guid.NewGuid()}@example.com";
        var payload = new CreateNewUserPayload
        {
            Email = email,
            Name = "Existence Test User",
            FireBaseUserId = $"firebase-{Guid.NewGuid()}"
        };

        // Act & Assert - User should not exist initially
        var existsBefore = await _userService.UserExistsAsync(email);
        existsBefore.Should().BeFalse();

        // Create user
        var userId = await _userService.CreateUserAsync(payload);

        // User should exist after creation
        var existsAfter = await _userService.UserExistsAsync(email);
        existsAfter.Should().BeTrue();

        // Cleanup
        await _userService.DeleteUserAsync(userId);
    }
}
