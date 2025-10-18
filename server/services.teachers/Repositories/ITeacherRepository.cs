using services.teachers.Domain;

namespace services.teachers.Repositories;

public interface ITeacherRepository
{
    Task<IEnumerable<Teacher>> GetAllTeachersAsync();
    Task<IEnumerable<Teacher>> GetActiveTeachersAsync();
    Task<Teacher?> GetTeacherByIdAsync(Guid id);
    Task<Teacher?> GetTeacherByNameAsync(string name);
    Task<Teacher> CreateTeacherAsync(Teacher teacher);
    Task<Teacher?> UpdateTeacherAsync(Guid id, Teacher teacher);
    Task<bool> DeleteTeacherAsync(Guid id);
    Task<bool> DeactivateTeacherAsync(Guid id);
    Task<IEnumerable<Teacher>> GetTeachersByFocusAsync(string focus);
    Task<IEnumerable<Teacher>> GetTeachersByComplexityAsync(string complexity);
}
