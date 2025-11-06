using services.users.Domain;
using services.users.Models;

namespace services.users.Services;

public static class UserMappingService
{
    public static UserEntity ToEntity(this User user)
    {
        return new UserEntity
        {
            UserId = user.UserId,
            Email = user.Email,
            Name = user.Name,
            FireBaseUserId = user.FireBaseUserId,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public static User ToDomain(this UserEntity entity)
    {
        return new User
        {
            UserId = entity.UserId,
            Email = entity.Email,
            Name = entity.Name,
            FireBaseUserId = entity.FireBaseUserId,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static User ToDomain(this CreateNewUserPayload request, Guid userId)
    {
        return new User
        {
            UserId = userId,
            Email = request.Email ?? string.Empty,
            Name = request.Name,
            FireBaseUserId = request.FireBaseUserId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
    }

    public static User ToDomain(this UpdateUserPayload request)
    {
        return new User
        {
            UserId = request.UserId,
            Email = request.Email ?? string.Empty,
            Name = request.Name,
            FireBaseUserId = request.FireBaseUserId,
            UpdatedAt = DateTime.UtcNow
        };
    }
}

