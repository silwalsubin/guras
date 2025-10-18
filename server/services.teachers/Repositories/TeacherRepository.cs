using Dapper;
using services.teachers.Domain;
using utilities.Persistence.ConnectionFactories;

namespace services.teachers.Repositories;

public class TeacherRepository : ITeacherRepository
{
    private readonly IDbConnectionFactory _connectionFactory;
    private readonly ILogger<TeacherRepository> _logger;

    public TeacherRepository(IDbConnectionFactory connectionFactory, ILogger<TeacherRepository> logger)
    {
        _connectionFactory = connectionFactory;
        _logger = logger;
    }

    public async Task<IEnumerable<Teacher>> GetAllTeachersAsync()
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            SELECT 
                id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at
            FROM teachers
            ORDER BY display_name";

        var teachers = await connection.QueryAsync<Teacher>(sql);
        return teachers;
    }

    public async Task<IEnumerable<Teacher>> GetActiveTeachersAsync()
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            SELECT 
                id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at
            FROM teachers
            WHERE is_active = true
            ORDER BY display_name";

        var teachers = await connection.QueryAsync<Teacher>(sql);
        return teachers;
    }

    public async Task<Teacher?> GetTeacherByIdAsync(Guid id)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            SELECT 
                id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at
            FROM teachers
            WHERE id = @Id";

        var teacher = await connection.QueryFirstOrDefaultAsync<Teacher>(sql, new { Id = id });
        return teacher;
    }

    public async Task<Teacher?> GetTeacherByNameAsync(string name)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            SELECT 
                id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at
            FROM teachers
            WHERE name = @Name";

        var teacher = await connection.QueryFirstOrDefaultAsync<Teacher>(sql, new { Name = name });
        return teacher;
    }

    public async Task<Teacher> CreateTeacherAsync(Teacher teacher)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            INSERT INTO teachers (
                name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active
            )
            VALUES (
                @Name, @DisplayName, @FullName, @BirthYear, @DeathYear, @Nationality, @Description,
                @TraditionName, @TraditionDescription, @TraditionOrigin, @Era, @AvatarUrl, @BackgroundUrl,
                @CoreTeachings, @TeachingApproach, @TeachingTone, @TeachingFocus, @TeachingComplexity,
                @PersonalityTraits, @IsActive
            )
            RETURNING id, created_at, updated_at";

        var result = await connection.QueryFirstAsync<dynamic>(sql, new
        {
            teacher.Name,
            teacher.DisplayName,
            teacher.FullName,
            teacher.BirthYear,
            teacher.DeathYear,
            teacher.Nationality,
            teacher.Description,
            teacher.TraditionName,
            teacher.TraditionDescription,
            teacher.TraditionOrigin,
            teacher.Era,
            teacher.AvatarUrl,
            teacher.BackgroundUrl,
            CoreTeachings = teacher.CoreTeachings.ToArray(),
            teacher.TeachingApproach,
            teacher.TeachingTone,
            teacher.TeachingFocus,
            teacher.TeachingComplexity,
            PersonalityTraits = teacher.PersonalityTraits.ToArray(),
            teacher.IsActive
        });

        teacher.Id = result.id;
        teacher.CreatedAt = result.created_at;
        teacher.UpdatedAt = result.updated_at;

        return teacher;
    }

    public async Task<Teacher?> UpdateTeacherAsync(Guid id, Teacher teacher)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            UPDATE teachers SET
                display_name = @DisplayName,
                full_name = @FullName,
                birth_year = @BirthYear,
                death_year = @DeathYear,
                nationality = @Nationality,
                description = @Description,
                tradition_name = @TraditionName,
                tradition_description = @TraditionDescription,
                tradition_origin = @TraditionOrigin,
                era = @Era,
                avatar_url = @AvatarUrl,
                background_url = @BackgroundUrl,
                core_teachings = @CoreTeachings,
                teaching_approach = @TeachingApproach,
                teaching_tone = @TeachingTone,
                teaching_focus = @TeachingFocus,
                teaching_complexity = @TeachingComplexity,
                personality_traits = @PersonalityTraits,
                is_active = @IsActive,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = @Id
            RETURNING id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at";

        var result = await connection.QueryFirstOrDefaultAsync<Teacher>(sql, new
        {
            Id = id,
            teacher.DisplayName,
            teacher.FullName,
            teacher.BirthYear,
            teacher.DeathYear,
            teacher.Nationality,
            teacher.Description,
            teacher.TraditionName,
            teacher.TraditionDescription,
            teacher.TraditionOrigin,
            teacher.Era,
            teacher.AvatarUrl,
            teacher.BackgroundUrl,
            CoreTeachings = teacher.CoreTeachings.ToArray(),
            teacher.TeachingApproach,
            teacher.TeachingTone,
            teacher.TeachingFocus,
            teacher.TeachingComplexity,
            PersonalityTraits = teacher.PersonalityTraits.ToArray(),
            teacher.IsActive
        });

        return result;
    }

    public async Task<bool> DeleteTeacherAsync(Guid id)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = "DELETE FROM teachers WHERE id = @Id";
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        
        return rowsAffected > 0;
    }

    public async Task<bool> DeactivateTeacherAsync(Guid id)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            UPDATE teachers 
            SET is_active = false, updated_at = CURRENT_TIMESTAMP 
            WHERE id = @Id";
        
        var rowsAffected = await connection.ExecuteAsync(sql, new { Id = id });
        return rowsAffected > 0;
    }

    public async Task<IEnumerable<Teacher>> GetTeachersByFocusAsync(string focus)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            SELECT 
                id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at
            FROM teachers
            WHERE teaching_focus = @Focus AND is_active = true
            ORDER BY display_name";

        var teachers = await connection.QueryAsync<Teacher>(sql, new { Focus = focus });
        return teachers;
    }

    public async Task<IEnumerable<Teacher>> GetTeachersByComplexityAsync(string complexity)
    {
        using var connection = await _connectionFactory.GetConnectionAsync();
        
        const string sql = @"
            SELECT 
                id, name, display_name, full_name, birth_year, death_year, nationality, description,
                tradition_name, tradition_description, tradition_origin, era, avatar_url, background_url,
                core_teachings, teaching_approach, teaching_tone, teaching_focus, teaching_complexity,
                personality_traits, is_active, created_at, updated_at
            FROM teachers
            WHERE teaching_complexity = @Complexity AND is_active = true
            ORDER BY display_name";

        var teachers = await connection.QueryAsync<Teacher>(sql, new { Complexity = complexity });
        return teachers;
    }
}
