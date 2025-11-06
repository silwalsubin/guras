using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.users.Data;
using services.users.Domain;
using services.users.Models;
using services.users.Services;

namespace services.users.Persistence;

public class UserRepository : IUserRepository
{
    private readonly UsersDbContext _context;
    private readonly ILogger<UserRepository> _logger;

    public UserRepository(UsersDbContext context, ILogger<UserRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User?> GetByUserIdAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Retrieving user by ID: {UserId} using Entity Framework", userId);
            var entity = await _context.Users
                .FirstOrDefaultAsync(u => u.UserId == userId);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by ID: {UserId}", userId);
            throw;
        }
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        try
        {
            _logger.LogInformation("Retrieving user by email: {Email} using Entity Framework", email);
            var entity = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == email);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by email: {Email}", email);
            throw;
        }
    }

    public async Task<User?> GetByFirebaseUidAsync(string fireBaseUserId)
    {
        try
        {
            _logger.LogInformation("Retrieving user by Firebase UID using Entity Framework");
            var entity = await _context.Users
                .FirstOrDefaultAsync(u => u.FireBaseUserId == fireBaseUserId);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving user by Firebase UID");
            throw;
        }
    }

    public async Task CreateAsync(User user)
    {
        try
        {
            _logger.LogInformation("Creating user: {Email} using Entity Framework", user.Email);

            var entity = user.ToEntity();
            _context.Users.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created user: {Email} with ID: {UserId}",
                user.Email, entity.UserId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating user: {Email}", user.Email);
            throw;
        }
    }

    public async Task<User> UpdateAsync(User user)
    {
        try
        {
            _logger.LogInformation("Updating user: {UserId} using Entity Framework", user.UserId);

            var entity = await _context.Users.FindAsync(user.UserId);
            if (entity == null)
            {
                _logger.LogWarning("User not found for update: {UserId}", user.UserId);
                throw new InvalidOperationException($"User with ID {user.UserId} not found");
            }

            // Update entity properties
            entity.Email = user.Email;
            entity.Name = user.Name;
            entity.FireBaseUserId = user.FireBaseUserId;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated user: {UserId}", user.UserId);
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user: {UserId}", user.UserId);
            throw;
        }
    }

    public async Task<bool> ExistsAsync(string email)
    {
        try
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if user exists: {Email}", email);
            throw;
        }
    }

    public async Task<bool> DeleteAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Deleting user: {UserId} using Entity Framework", userId);

            var entity = await _context.Users.FindAsync(userId);
            if (entity == null)
            {
                _logger.LogWarning("User not found for deletion: {UserId}", userId);
                return false;
            }

            _context.Users.Remove(entity);
            var result = await _context.SaveChangesAsync();

            _logger.LogInformation("User deletion result: {Result} for ID: {UserId}", result > 0, userId);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting user: {UserId}", userId);
            throw;
        }
    }
}
