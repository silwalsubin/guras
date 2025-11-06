using Microsoft.Extensions.Logging;
using services.users.Domain;
using services.users.Repositories;
using services.users.Services;

namespace services.users.Services;

public class UserService(IUserRepository userRepository, ILogger<UserService> logger)
{
    public async Task<User?> GetUserByIdAsync(Guid userId)
    {
        var user = await userRepository.GetByUserIdAsync(userId);
        return user;
    }

    public async Task<User?> GetUserByEmailAsync(string email)
    {
        return await userRepository.GetByEmailAsync(email);
    }

    public async Task<User?> GetUserByFireBaseUserId(string fireBaseUserId)
    {
        return await userRepository.GetByFirebaseUidAsync(fireBaseUserId);
    }

    public async Task<User?> GetUserByFireBaseUserIdAsync(string fireBaseUserId)
    {
        return await userRepository.GetByFirebaseUidAsync(fireBaseUserId);
    }

    public async Task<Guid> CreateUserAsync(CreateNewUserPayload payload)
    {
        payload.Validate();
        var existingUser = await userRepository.GetByEmailAsync(payload.Email!);
        if (existingUser != null)
        {
            throw new InvalidOperationException($"User with email {payload.Email} already exists");
        }

        var userId = Guid.NewGuid();
        var user = payload.ToDomain(userId);

        await userRepository.CreateAsync(user);
        logger.LogInformation("Created user with ID {UserId} for email {Email}", user.UserId, user.Email);
        return user.UserId;
    }

    public async Task UpdateUserAsync(UpdateUserPayload payload)
    {
        payload.Validate();

        var existingUser = await userRepository.GetByUserIdAsync(payload.UserId);
        if (existingUser == null)
        {
            throw new InvalidOperationException($"User with ID {payload.UserId} not found");
        }

        var user = payload.ToDomain();
        await userRepository.UpdateAsync(user);
        logger.LogInformation("Updated user with ID {UserId} for email {Email}", payload.UserId, payload.Email);
    }

    public async Task<bool> UserExistsAsync(string email)
    {
        return await userRepository.ExistsAsync(email);
    }

    public async Task<bool> DeleteUserAsync(Guid userId)
    {
        var existingUser = await userRepository.GetByUserIdAsync(userId);
        if (existingUser == null)
        {
            return false;
        }
        return await userRepository.DeleteAsync(userId);
    }
}
