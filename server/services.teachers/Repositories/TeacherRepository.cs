using Microsoft.EntityFrameworkCore;
using services.teachers.Data;
using services.teachers.Domain;
using services.teachers.Models;
using services.teachers.Services;

namespace services.teachers.Repositories;

public class TeacherRepository : ITeacherRepository
{
    private readonly TeachersDbContext _context;
    private readonly ILogger<TeacherRepository> _logger;

    public TeacherRepository(TeachersDbContext context, ILogger<TeacherRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<IEnumerable<Teacher>> GetAllTeachersAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all teachers using Entity Framework");
            var entities = await _context.Teachers
                .OrderBy(t => t.DisplayName)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all teachers");
            throw;
        }
    }

    public async Task<IEnumerable<Teacher>> GetActiveTeachersAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving active teachers using Entity Framework");
            var entities = await _context.Teachers
                .Where(t => t.IsActive)
                .OrderBy(t => t.DisplayName)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active teachers");
            throw;
        }
    }

    public async Task<Teacher?> GetTeacherByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving teacher by ID: {TeacherId} using Entity Framework", id);
            var entity = await _context.Teachers
                .FirstOrDefaultAsync(t => t.Id == id);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher by ID: {TeacherId}", id);
            throw;
        }
    }

    public async Task<Teacher?> GetTeacherByNameAsync(string name)
    {
        try
        {
            _logger.LogInformation("Retrieving teacher by name: {TeacherName} using Entity Framework", name);
            var entity = await _context.Teachers
                .FirstOrDefaultAsync(t => t.Name == name);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher by name: {TeacherName}", name);
            throw;
        }
    }

    public async Task<Teacher> CreateTeacherAsync(Teacher teacher)
    {
        try
        {
            _logger.LogInformation("Creating teacher: {TeacherName} using Entity Framework", teacher.Name);
            
            var entity = teacher.ToEntity();
            _context.Teachers.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully created teacher: {TeacherName} with ID: {TeacherId}", 
                teacher.Name, entity.Id);
            
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating teacher: {TeacherName}", teacher.Name);
            throw;
        }
    }

    public async Task<Teacher?> UpdateTeacherAsync(Guid id, Teacher teacher)
    {
        try
        {
            _logger.LogInformation("Updating teacher: {TeacherId} using Entity Framework", id);
            
            var entity = await _context.Teachers.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning("Teacher not found for update: {TeacherId}", id);
                return null;
            }

            // Update entity properties
            entity.Name = teacher.Name;
            entity.DisplayName = teacher.DisplayName;
            entity.FullName = teacher.FullName;
            entity.BirthYear = teacher.BirthYear;
            entity.DeathYear = teacher.DeathYear;
            entity.Nationality = teacher.Nationality;
            entity.Description = teacher.Description;
            entity.TraditionName = teacher.TraditionName;
            entity.TraditionDescription = teacher.TraditionDescription;
            entity.TraditionOrigin = teacher.TraditionOrigin;
            entity.Era = teacher.Era;
            entity.AvatarUrl = teacher.AvatarUrl;
            entity.BackgroundUrl = teacher.BackgroundUrl;
            entity.CoreTeachings = teacher.CoreTeachings;
            entity.TeachingApproach = teacher.TeachingApproach;
            entity.TeachingTone = teacher.TeachingTone;
            entity.TeachingFocus = teacher.TeachingFocus;
            entity.TeachingComplexity = teacher.TeachingComplexity;
            entity.PersonalityTraits = teacher.PersonalityTraits;
            entity.IsActive = teacher.IsActive;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated teacher: {TeacherId}", id);
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating teacher: {TeacherId}", id);
            throw;
        }
    }

    public async Task<bool> DeleteTeacherAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deleting teacher: {TeacherId} using Entity Framework", id);
            
            var entity = await _context.Teachers.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning("Teacher not found for deletion: {TeacherId}", id);
                return false;
            }

            _context.Teachers.Remove(entity);
            var result = await _context.SaveChangesAsync();
            
            _logger.LogInformation("Teacher deletion result: {Result} for ID: {TeacherId}", result > 0, id);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting teacher: {TeacherId}", id);
            throw;
        }
    }

    public async Task<bool> DeactivateTeacherAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Deactivating teacher: {TeacherId} using Entity Framework", id);
            
            var entity = await _context.Teachers.FindAsync(id);
            if (entity == null)
            {
                _logger.LogWarning("Teacher not found for deactivation: {TeacherId}", id);
                return false;
            }

            entity.IsActive = false;
            entity.UpdatedAt = DateTime.UtcNow;
            
            var result = await _context.SaveChangesAsync();
            
            _logger.LogInformation("Teacher deactivation result: {Result} for ID: {TeacherId}", result > 0, id);
            return result > 0;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating teacher: {TeacherId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<Teacher>> GetTeachersByFocusAsync(string focus)
    {
        try
        {
            _logger.LogInformation("Retrieving teachers by focus: {Focus} using Entity Framework", focus);
            var entities = await _context.Teachers
                .Where(t => t.TeachingFocus == focus && t.IsActive)
                .OrderBy(t => t.DisplayName)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teachers by focus: {Focus}", focus);
            throw;
        }
    }

    public async Task<IEnumerable<Teacher>> GetTeachersByComplexityAsync(string complexity)
    {
        try
        {
            _logger.LogInformation("Retrieving teachers by complexity: {Complexity} using Entity Framework", complexity);
            var entities = await _context.Teachers
                .Where(t => t.TeachingComplexity == complexity && t.IsActive)
                .OrderBy(t => t.DisplayName)
                .ToListAsync();

            return entities.Select(e => e.ToDomain());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teachers by complexity: {Complexity}", complexity);
            throw;
        }
    }

    public async Task<bool> TeacherExistsAsync(Guid id)
    {
        try
        {
            return await _context.Teachers.AnyAsync(t => t.Id == id);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if teacher exists: {TeacherId}", id);
            throw;
        }
    }

    public async Task<bool> TeacherNameExistsAsync(string name)
    {
        try
        {
            return await _context.Teachers.AnyAsync(t => t.Name == name);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if teacher name exists: {TeacherName}", name);
            throw;
        }
    }
}
