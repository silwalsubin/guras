using services.users.Domain;

namespace services.users.Services;

/// <summary>
/// Service interface for user management operations
/// </summary>
public interface IUserService
{
    /// <summary>
    /// Get a user by their unique identifier
    /// </summary>
    Task<User?> GetUserByIdAsync(Guid userId);

    /// <summary>
    /// Get a user by their email address
    /// </summary>
    Task<User?> GetUserByEmailAsync(string email);

    /// <summary>
    /// Get a user by their Firebase user ID
    /// </summary>
    Task<User?> GetUserByFireBaseUserId(string fireBaseUserId);

    /// <summary>
    /// Get a user by their Firebase user ID (async version)
    /// </summary>
    Task<User?> GetUserByFireBaseUserIdAsync(string fireBaseUserId);

    /// <summary>
    /// Create a new user
    /// </summary>
    Task<Guid> CreateUserAsync(CreateNewUserPayload payload);

    /// <summary>
    /// Update an existing user
    /// </summary>
    Task UpdateUserAsync(UpdateUserPayload payload);

    /// <summary>
    /// Check if a user exists by email
    /// </summary>
    Task<bool> UserExistsAsync(string email);

    /// <summary>
    /// Delete a user by their unique identifier
    /// </summary>
    Task<bool> DeleteUserAsync(Guid userId);
}

