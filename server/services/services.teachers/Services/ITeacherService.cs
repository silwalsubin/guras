using services.teachers.Domain;

namespace services.teachers.Services;

public interface ITeacherService
{
    Task<IEnumerable<TeacherResponse>> GetAllTeachersAsync();
    Task<IEnumerable<TeacherResponse>> GetActiveTeachersAsync();
    Task<TeacherResponse?> GetTeacherByIdAsync(Guid id);
    Task<TeacherResponse?> GetTeacherByNameAsync(string name);
    Task<TeacherResponse> CreateTeacherAsync(CreateTeacherRequest request);
    Task<TeacherResponse?> UpdateTeacherAsync(Guid id, UpdateTeacherRequest request);
    Task<bool> DeleteTeacherAsync(Guid id);
    Task<bool> DeactivateTeacherAsync(Guid id);
    Task<IEnumerable<TeacherResponse>> GetTeachersByFocusAsync(string focus);
    Task<IEnumerable<TeacherResponse>> GetTeachersByComplexityAsync(string complexity);
}
