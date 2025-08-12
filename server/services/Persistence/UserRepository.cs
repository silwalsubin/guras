using Dapper;
using utilities.Persistence.ConnectionFactories;

namespace services.Persistence;

public class UserRepository(IDbConnectionFactory dbConnectionFactory) : IUserRepository
{
    public async Task<UserRecord?> GetByUserIdAsync(Guid userId)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = @"
            SELECT user_id as UserId, email as Email, name as Name, firebase_user_id as FireBaseUserId, 
                   created_at as CreatedAt, updated_at as UpdatedAt 
            FROM users WHERE user_id = @UserId";
        return await connection.QuerySingleOrDefaultAsync<UserRecord>(sql, new { UserId = userId });
    }

    public async Task<UserRecord?> GetByEmailAsync(string email)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = @"
            SELECT user_id as UserId, email as Email, name as Name, firebase_user_id as FireBaseUserId, 
                   created_at as CreatedAt, updated_at as UpdatedAt 
            FROM users WHERE email = @Email";
        return await connection.QuerySingleOrDefaultAsync<UserRecord>(sql, new { Email = email });
    }

    public async Task<UserRecord?> GetByFirebaseUidAsync(string fireBaseUserId)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = @"
            SELECT user_id as UserId, email as Email, name as Name, firebase_user_id as FireBaseUserId, 
                   created_at as CreatedAt, updated_at as UpdatedAt 
            FROM users WHERE firebase_user_id = @fireBaseUserId";
        return await connection.QuerySingleOrDefaultAsync<UserRecord>(sql, new { FireBaseUserId = fireBaseUserId });
    }

    public async Task CreateAsync(UserRecord user)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = @"
            INSERT INTO users (user_id, email, name, firebase_user_id, created_at, updated_at) 
            VALUES (@UserId, @Email, @Name, @FireBaseUserId, @CreatedAt, @UpdatedAt);
        ";
        await connection.ExecuteAsync(sql, user);
    }

    public async Task<UserRecord> UpdateAsync(UserRecord user)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = @"
            UPDATE users 
            SET email = @Email, name = @Name, firebase_user_id = @FireBaseUserId, updated_at = @UpdatedAt 
            WHERE user_id = @UserId";
        await connection.ExecuteAsync(sql, user);
        return user;
    }

    public async Task<bool> ExistsAsync(string email)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = "SELECT COUNT(1) FROM users WHERE email = @Email";
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Email = email });
        return count > 0;
    }

    public async Task<bool> DeleteAsync(Guid userId)
    {
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        const string sql = "DELETE FROM users WHERE user_id = @UserId";
        var rowsAffected = await connection.ExecuteAsync(sql, new { UserId = userId });
        return rowsAffected > 0;
    }
}
