namespace services.users.Persistence;

public interface IUserRepository
{
    Task<UserRecord?> GetByUserIdAsync(Guid userId);
    Task<UserRecord?> GetByEmailAsync(string email);
    Task<UserRecord?> GetByFirebaseUidAsync(string fireBaseUserId);
    Task CreateAsync(UserRecord user);
    Task<UserRecord> UpdateAsync(UserRecord user);
    Task<bool> ExistsAsync(string email);
    Task<bool> DeleteAsync(Guid userId);
}
