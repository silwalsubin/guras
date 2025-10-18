using services.teachers.Domain;
using services.teachers.Repositories;

namespace services.teachers.Services;

public class TeacherService : ITeacherService
{
    private readonly ITeacherRepository _teacherRepository;
    private readonly ILogger<TeacherService> _logger;

    public TeacherService(ITeacherRepository teacherRepository, ILogger<TeacherService> logger)
    {
        _teacherRepository = teacherRepository;
        _logger = logger;
    }

    public async Task<IEnumerable<TeacherResponse>> GetAllTeachersAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all teachers");
            var teachers = await _teacherRepository.GetAllTeachersAsync();
            return teachers.Select(MapToResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all teachers");
            throw;
        }
    }

    public async Task<IEnumerable<TeacherResponse>> GetActiveTeachersAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving active teachers");
            var teachers = await _teacherRepository.GetActiveTeachersAsync();
            return teachers.Select(MapToResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active teachers");
            throw;
        }
    }

    public async Task<TeacherResponse?> GetTeacherByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving teacher by ID: {TeacherId}", id);
            var teacher = await _teacherRepository.GetTeacherByIdAsync(id);
            return teacher != null ? MapToResponse(teacher) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher by ID: {TeacherId}", id);
            throw;
        }
    }

    public async Task<TeacherResponse?> GetTeacherByNameAsync(string name)
    {
        try
        {
            _logger.LogInformation("Retrieving teacher by name: {TeacherName}", name);
            var teacher = await _teacherRepository.GetTeacherByNameAsync(name);
            return teacher != null ? MapToResponse(teacher) : null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher by name: {TeacherName}", name);
            throw;
        }
    }

    public async Task<TeacherResponse> CreateTeacherAsync(CreateTeacherRequest request)
    {
        try
        {
            _logger.LogInformation("Creating new teacher: {TeacherName}", request.Name);
            
            var teacher = new Teacher
            {
                Name = request.Name,
                DisplayName = request.DisplayName,
                FullName = request.FullName,
                BirthYear = request.BirthYear,
                DeathYear = request.DeathYear,
                Nationality = request.Nationality,
                Description = request.Description,
                TraditionName = request.TraditionName,
                TraditionDescription = request.TraditionDescription,
                TraditionOrigin = request.TraditionOrigin,
                Era = request.Era,
                AvatarUrl = request.AvatarUrl,
                BackgroundUrl = request.BackgroundUrl,
                CoreTeachings = request.CoreTeachings,
                TeachingApproach = request.TeachingApproach,
                TeachingTone = request.TeachingTone,
                TeachingFocus = request.TeachingFocus,
                TeachingComplexity = request.TeachingComplexity,
                PersonalityTraits = request.PersonalityTraits,
                IsActive = true
            };

            var createdTeacher = await _teacherRepository.CreateTeacherAsync(teacher);
            _logger.LogInformation("Successfully created teacher: {TeacherName} with ID: {TeacherId}", 
                createdTeacher.Name, createdTeacher.Id);
            
            return MapToResponse(createdTeacher);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating teacher: {TeacherName}", request.Name);
            throw;
        }
    }

    public async Task<TeacherResponse?> UpdateTeacherAsync(Guid id, UpdateTeacherRequest request)
    {
        try
        {
            _logger.LogInformation("Updating teacher: {TeacherId}", id);
            
            var existingTeacher = await _teacherRepository.GetTeacherByIdAsync(id);
            if (existingTeacher == null)
            {
                _logger.LogWarning("Teacher not found for update: {TeacherId}", id);
                return null;
            }

            // Update only provided fields
            if (request.DisplayName != null) existingTeacher.DisplayName = request.DisplayName;
            if (request.FullName != null) existingTeacher.FullName = request.FullName;
            if (request.BirthYear.HasValue) existingTeacher.BirthYear = request.BirthYear;
            if (request.DeathYear.HasValue) existingTeacher.DeathYear = request.DeathYear;
            if (request.Nationality != null) existingTeacher.Nationality = request.Nationality;
            if (request.Description != null) existingTeacher.Description = request.Description;
            if (request.TraditionName != null) existingTeacher.TraditionName = request.TraditionName;
            if (request.TraditionDescription != null) existingTeacher.TraditionDescription = request.TraditionDescription;
            if (request.TraditionOrigin != null) existingTeacher.TraditionOrigin = request.TraditionOrigin;
            if (request.Era != null) existingTeacher.Era = request.Era;
            if (request.AvatarUrl != null) existingTeacher.AvatarUrl = request.AvatarUrl;
            if (request.BackgroundUrl != null) existingTeacher.BackgroundUrl = request.BackgroundUrl;
            if (request.CoreTeachings != null) existingTeacher.CoreTeachings = request.CoreTeachings;
            if (request.TeachingApproach != null) existingTeacher.TeachingApproach = request.TeachingApproach;
            if (request.TeachingTone != null) existingTeacher.TeachingTone = request.TeachingTone;
            if (request.TeachingFocus != null) existingTeacher.TeachingFocus = request.TeachingFocus;
            if (request.TeachingComplexity != null) existingTeacher.TeachingComplexity = request.TeachingComplexity;
            if (request.PersonalityTraits != null) existingTeacher.PersonalityTraits = request.PersonalityTraits;
            if (request.IsActive.HasValue) existingTeacher.IsActive = request.IsActive.Value;

            var updatedTeacher = await _teacherRepository.UpdateTeacherAsync(id, existingTeacher);
            if (updatedTeacher == null)
            {
                _logger.LogWarning("Failed to update teacher: {TeacherId}", id);
                return null;
            }

            _logger.LogInformation("Successfully updated teacher: {TeacherId}", id);
            return MapToResponse(updatedTeacher);
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
            _logger.LogInformation("Deleting teacher: {TeacherId}", id);
            var result = await _teacherRepository.DeleteTeacherAsync(id);
            _logger.LogInformation("Teacher deletion result: {Result} for ID: {TeacherId}", result, id);
            return result;
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
            _logger.LogInformation("Deactivating teacher: {TeacherId}", id);
            var result = await _teacherRepository.DeactivateTeacherAsync(id);
            _logger.LogInformation("Teacher deactivation result: {Result} for ID: {TeacherId}", result, id);
            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating teacher: {TeacherId}", id);
            throw;
        }
    }

    public async Task<IEnumerable<TeacherResponse>> GetTeachersByFocusAsync(string focus)
    {
        try
        {
            _logger.LogInformation("Retrieving teachers by focus: {Focus}", focus);
            var teachers = await _teacherRepository.GetTeachersByFocusAsync(focus);
            return teachers.Select(MapToResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teachers by focus: {Focus}", focus);
            throw;
        }
    }

    public async Task<IEnumerable<TeacherResponse>> GetTeachersByComplexityAsync(string complexity)
    {
        try
        {
            _logger.LogInformation("Retrieving teachers by complexity: {Complexity}", complexity);
            var teachers = await _teacherRepository.GetTeachersByComplexityAsync(complexity);
            return teachers.Select(MapToResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teachers by complexity: {Complexity}", complexity);
            throw;
        }
    }

    private static TeacherResponse MapToResponse(Teacher teacher)
    {
        return new TeacherResponse
        {
            Id = teacher.Id,
            Name = teacher.Name,
            DisplayName = teacher.DisplayName,
            FullName = teacher.FullName,
            BirthYear = teacher.BirthYear,
            DeathYear = teacher.DeathYear,
            Nationality = teacher.Nationality,
            Description = teacher.Description,
            TraditionName = teacher.TraditionName,
            TraditionDescription = teacher.TraditionDescription,
            TraditionOrigin = teacher.TraditionOrigin,
            Era = teacher.Era,
            AvatarUrl = teacher.AvatarUrl,
            BackgroundUrl = teacher.BackgroundUrl,
            CoreTeachings = teacher.CoreTeachings,
            TeachingApproach = teacher.TeachingApproach,
            TeachingTone = teacher.TeachingTone,
            TeachingFocus = teacher.TeachingFocus,
            TeachingComplexity = teacher.TeachingComplexity,
            PersonalityTraits = teacher.PersonalityTraits,
            IsActive = teacher.IsActive,
            CreatedAt = teacher.CreatedAt,
            UpdatedAt = teacher.UpdatedAt
        };
    }
}
