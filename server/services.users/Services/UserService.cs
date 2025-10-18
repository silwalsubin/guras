using Microsoft.Extensions.Logging;
using services.users.Domain;
using services.users.Persistence;

namespace services.users.Services;

public class UserService(IUserRepository userRepository, ILogger<UserService> logger)
{
    public async Task<UserRecord?> GetUserByIdAsync(Guid userId)
    {
        var user = await userRepository.GetByUserIdAsync(userId);
        return user;
    }

    public async Task<UserRecord?> GetUserByEmailAsync(string email)
    {
        return await userRepository.GetByEmailAsync(email);
    }

    public async Task<UserRecord?> GetUserByFireBaseUserId(string fireBaseUserId)
    {
        return await userRepository.GetByFirebaseUidAsync(fireBaseUserId);
    }

    public async Task<UserRecord?> GetUserByFireBaseUserIdAsync(string fireBaseUserId)
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

        var userRecord = new UserRecord
        {
            Email = payload.Email,
            Name = payload.Name,
            FireBaseUserId = payload.FireBaseUserId,
            UserId = Guid.NewGuid(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await userRepository.CreateAsync(userRecord);
        logger.LogInformation($"Created user with ID {userRecord.UserId} for email {userRecord.Email}");
        return userRecord.UserId;
    }

    public async Task UpdateUserAsync(UpdateUserPayload payload)
    {
        payload.Validate();

        var existingUser = await userRepository.GetByUserIdAsync(payload.UserId);
        if (existingUser == null)
        {
            throw new InvalidOperationException($"User with ID {payload.UserId} not found");
        }

        var userRecord = new UserRecord
        {
            Email = payload.Email,
            Name = payload.Name,
            FireBaseUserId = payload.FireBaseUserId,
            UserId = payload.UserId,
            UpdatedAt = DateTime.UtcNow
        };

        await userRepository.UpdateAsync(userRecord);
        logger.LogInformation($"Updated user with ID {payload.UserId} for email {payload.Email}");
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
