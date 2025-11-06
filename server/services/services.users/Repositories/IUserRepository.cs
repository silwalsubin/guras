using services.users.Domain;

namespace services.users.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUserIdAsync(Guid userId);
    Task<User?> GetByEmailAsync(string email);
    Task<User?> GetByFirebaseUidAsync(string fireBaseUserId);
    Task CreateAsync(User user);
    Task<User> UpdateAsync(User user);
    Task<bool> ExistsAsync(string email);
    Task<bool> DeleteAsync(Guid userId);
}

