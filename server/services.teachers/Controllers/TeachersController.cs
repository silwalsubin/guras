using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.teachers.Services;
using services.teachers.Requests;
using utilities.Controllers;

namespace services.teachers.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TeachersController : BaseController
{
    private readonly ITeacherService _teacherService;
    private readonly ILogger<TeachersController> _logger;

    public TeachersController(ITeacherService teacherService, ILogger<TeachersController> logger)
    {
        _teacherService = teacherService;
        _logger = logger;
    }

    /// <summary>
    /// Get all teachers
    /// </summary>
    /// <returns>List of all teachers</returns>
    [HttpGet]
    public async Task<IActionResult> GetAllTeachers()
    {
        try
        {
            var teachers = await _teacherService.GetAllTeachersAsync();
            _logger.LogInformation("Retrieved {Count} teachers", teachers.Count());
            return SuccessResponse(teachers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all teachers");
            return ErrorResponse("An error occurred while retrieving teachers", 500);
        }
    }

    /// <summary>
    /// Get all active teachers
    /// </summary>
    /// <returns>List of active teachers</returns>
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveTeachers()
    {
        try
        {
            var teachers = await _teacherService.GetActiveTeachersAsync();
            _logger.LogInformation("Retrieved {Count} active teachers", teachers.Count());
            return SuccessResponse(teachers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving active teachers");
            return ErrorResponse("An error occurred while retrieving active teachers", 500);
        }
    }

    /// <summary>
    /// Get a teacher by ID
    /// </summary>
    /// <param name="id">Teacher ID</param>
    /// <returns>Teacher details</returns>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetTeacherById(Guid id)
    {
        try
        {
            var teacher = await _teacherService.GetTeacherByIdAsync(id);
            if (teacher == null)
            {
                return NotFoundResponse("Teacher not found");
            }

            _logger.LogInformation("Retrieved teacher: {TeacherName} (ID: {TeacherId})", teacher.DisplayName, id);
            return SuccessResponse(teacher);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher by ID: {TeacherId}", id);
            return ErrorResponse("An error occurred while retrieving the teacher", 500);
        }
    }

    /// <summary>
    /// Get a teacher by name
    /// </summary>
    /// <param name="name">Teacher name</param>
    /// <returns>Teacher details</returns>
    [HttpGet("name/{name}")]
    public async Task<IActionResult> GetTeacherByName(string name)
    {
        try
        {
            var teacher = await _teacherService.GetTeacherByNameAsync(name);
            if (teacher == null)
            {
                return NotFoundResponse("Teacher not found");
            }

            _logger.LogInformation("Retrieved teacher by name: {TeacherName}", name);
            return SuccessResponse(teacher);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teacher by name: {TeacherName}", name);
            return ErrorResponse("An error occurred while retrieving the teacher", 500);
        }
    }

    /// <summary>
    /// Get teachers by focus area
    /// </summary>
    /// <param name="focus">Teaching focus (e.g., meditation, philosophy, service)</param>
    /// <returns>List of teachers with the specified focus</returns>
    [HttpGet("focus/{focus}")]
    public async Task<IActionResult> GetTeachersByFocus(string focus)
    {
        try
        {
            var teachers = await _teacherService.GetTeachersByFocusAsync(focus);
            _logger.LogInformation("Retrieved {Count} teachers with focus: {Focus}", teachers.Count(), focus);
            return SuccessResponse(teachers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teachers by focus: {Focus}", focus);
            return ErrorResponse("An error occurred while retrieving teachers by focus", 500);
        }
    }

    /// <summary>
    /// Get teachers by complexity level
    /// </summary>
    /// <param name="complexity">Teaching complexity (beginner, intermediate, advanced)</param>
    /// <returns>List of teachers with the specified complexity</returns>
    [HttpGet("complexity/{complexity}")]
    public async Task<IActionResult> GetTeachersByComplexity(string complexity)
    {
        try
        {
            var teachers = await _teacherService.GetTeachersByComplexityAsync(complexity);
            _logger.LogInformation("Retrieved {Count} teachers with complexity: {Complexity}", teachers.Count(), complexity);
            return SuccessResponse(teachers);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving teachers by complexity: {Complexity}", complexity);
            return ErrorResponse("An error occurred while retrieving teachers by complexity", 500);
        }
    }

    /// <summary>
    /// Create a new teacher (Admin only)
    /// </summary>
    /// <param name="request">Teacher creation request</param>
    /// <returns>Created teacher details</returns>
    [HttpPost]
    [Authorize] // Add admin role check in production
    public async Task<IActionResult> CreateTeacher([FromBody] CreateTeacherRequest request)
    {
        try
        {
            if (request == null)
            {
                return ValidationErrorResponse("Request body is required");
            }

            // Basic validation
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return ValidationErrorResponse("Name is required", "Name");
            }

            if (string.IsNullOrWhiteSpace(request.DisplayName))
            {
                return ValidationErrorResponse("Display name is required", "DisplayName");
            }

            // Map API request to domain request
            var domainRequest = new services.teachers.Domain.CreateTeacherRequest
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
                PersonalityTraits = request.PersonalityTraits
            };

            var teacher = await _teacherService.CreateTeacherAsync(domainRequest);
            _logger.LogInformation("Created new teacher: {TeacherName} (ID: {TeacherId})", teacher.DisplayName, teacher.Id);
            return SuccessResponse(teacher);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating teacher: {TeacherName}", request?.Name);
            return ErrorResponse("An error occurred while creating the teacher", 500);
        }
    }

    /// <summary>
    /// Update a teacher (Admin only)
    /// </summary>
    /// <param name="id">Teacher ID</param>
    /// <param name="request">Teacher update request</param>
    /// <returns>Updated teacher details</returns>
    [HttpPut("{id}")]
    [Authorize] // Add admin role check in production
    public async Task<IActionResult> UpdateTeacher(Guid id, [FromBody] UpdateTeacherRequest request)
    {
        try
        {
            if (request == null)
            {
                return ValidationErrorResponse("Request body is required");
            }

            // Map API request to domain request
            var domainRequest = new services.teachers.Domain.UpdateTeacherRequest
            {
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
                IsActive = request.IsActive
            };

            var teacher = await _teacherService.UpdateTeacherAsync(id, domainRequest);
            if (teacher == null)
            {
                return NotFoundResponse("Teacher not found");
            }

            _logger.LogInformation("Updated teacher: {TeacherName} (ID: {TeacherId})", teacher.DisplayName, id);
            return SuccessResponse(teacher);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating teacher: {TeacherId}", id);
            return ErrorResponse("An error occurred while updating the teacher", 500);
        }
    }

    /// <summary>
    /// Delete a teacher (Admin only)
    /// </summary>
    /// <param name="id">Teacher ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id}")]
    [Authorize] // Add admin role check in production
    public async Task<IActionResult> DeleteTeacher(Guid id)
    {
        try
        {
            var result = await _teacherService.DeleteTeacherAsync(id);
            if (!result)
            {
                return NotFoundResponse("Teacher not found");
            }

            _logger.LogInformation("Deleted teacher: {TeacherId}", id);
            return SuccessResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting teacher: {TeacherId}", id);
            return ErrorResponse("An error occurred while deleting the teacher", 500);
        }
    }

    /// <summary>
    /// Deactivate a teacher (Admin only)
    /// </summary>
    /// <param name="id">Teacher ID</param>
    /// <returns>Success status</returns>
    [HttpPut("{id}/deactivate")]
    [Authorize] // Add admin role check in production
    public async Task<IActionResult> DeactivateTeacher(Guid id)
    {
        try
        {
            var result = await _teacherService.DeactivateTeacherAsync(id);
            if (!result)
            {
                return NotFoundResponse("Teacher not found");
            }

            _logger.LogInformation("Deactivated teacher: {TeacherId}", id);
            return SuccessResponse();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deactivating teacher: {TeacherId}", id);
            return ErrorResponse("An error occurred while deactivating the teacher", 500);
        }
    }
}
