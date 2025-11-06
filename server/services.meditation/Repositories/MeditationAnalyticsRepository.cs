using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.meditation.Data;
using services.meditation.Domain;
using services.meditation.Models;
using services.meditation.Services;

namespace services.meditation.Repositories;

public class MeditationAnalyticsRepository : IMeditationAnalyticsRepository
{
    private readonly MeditationAnalyticsDbContext _context;
    private readonly ILogger<MeditationAnalyticsRepository> _logger;

    public MeditationAnalyticsRepository(MeditationAnalyticsDbContext context, ILogger<MeditationAnalyticsRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<MeditationAnalytics> CreateAsync(MeditationAnalytics analytics)
    {
        try
        {
            _logger.LogInformation("Creating meditation analytics record for user: {UserId} using Entity Framework", analytics.UserId);

            var entity = analytics.ToEntity();
            _context.MeditationAnalytics.Add(entity);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created meditation analytics record with ID: {AnalyticsId}", entity.Id);
            return entity.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating meditation analytics record for user: {UserId}", analytics.UserId);
            throw;
        }
    }

    public async Task<MeditationAnalytics?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving meditation analytics by ID: {AnalyticsId} using Entity Framework", id);
            var entity = await _context.MeditationAnalytics
                .FirstOrDefaultAsync(a => a.Id == id);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation analytics by ID: {AnalyticsId}", id);
            throw;
        }
    }

    public async Task<List<MeditationAnalytics>> GetByUserIdAsync(Guid userId, int limit = 50)
    {
        try
        {
            _logger.LogInformation("Retrieving meditation analytics for user: {UserId} using Entity Framework", userId);
            var entities = await _context.MeditationAnalytics
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.SessionStartTime)
                .Take(limit)
                .ToListAsync();

            return entities.Select(e => e.ToDomain()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation analytics for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<bool> UpdateAsync(MeditationAnalytics analytics)
    {
        try
        {
            _logger.LogInformation("Updating meditation analytics: {AnalyticsId} using Entity Framework", analytics.Id);

            var entity = await _context.MeditationAnalytics.FindAsync(analytics.Id);
            if (entity == null)
            {
                _logger.LogWarning("Meditation analytics not found for update: {AnalyticsId}", analytics.Id);
                return false;
            }

            // Update entity properties
            entity.SessionEndTime = analytics.SessionEndTime;
            entity.DurationSeconds = analytics.DurationSeconds;
            entity.Completed = analytics.Completed;
            entity.CompletionPercentage = analytics.CompletionPercentage;
            entity.PausedCount = analytics.PausedCount;
            entity.TotalPauseDurationSeconds = analytics.TotalPauseDurationSeconds;
            entity.EmotionalStateBefore = analytics.EmotionalStateBeforeType;
            entity.EmotionalStateBeforeScore = analytics.EmotionalStateBeforeScore;
            entity.EmotionalStateAfter = analytics.EmotionalStateAfterType;
            entity.EmotionalStateAfterScore = analytics.EmotionalStateAfterScore;
            entity.UserRating = analytics.UserRating;
            entity.UserNotes = analytics.UserNotes;
            entity.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Successfully updated meditation analytics: {AnalyticsId}", analytics.Id);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating meditation analytics: {AnalyticsId}", analytics.Id);
            throw;
        }
    }

    public async Task<MeditationPatternsDto> GetUserPatternsAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Retrieving meditation patterns for user: {UserId} using Entity Framework", userId);

            // Get preferred teachers
            var teachers = await _context.MeditationAnalytics
                .Where(a => a.UserId == userId && a.Completed)
                .GroupBy(a => a.TeacherName)
                .Select(g => new { Name = g.Key ?? "Unknown", Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Get preferred themes
            var themes = await _context.MeditationAnalytics
                .Where(a => a.UserId == userId && a.Completed)
                .GroupBy(a => a.MeditationTheme)
                .Select(g => new { Name = g.Key ?? "Unknown", Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(5)
                .ToListAsync();

            // Get best times of day
            var times = await _context.MeditationAnalytics
                .Where(a => a.UserId == userId)
                .GroupBy(a => a.TimeOfDay)
                .Select(g => new
                {
                    TimeOfDay = g.Key ?? "Unknown",
                    Count = g.Count(),
                    AverageCompletion = g.Average(a => (double?)a.CompletionPercentage) ?? 0
                })
                .OrderByDescending(x => x.AverageCompletion)
                .ToListAsync();

            return new MeditationPatternsDto
            {
                PreferredTeachers = teachers.Select(t => new PatternItem { Name = t.Name, Count = t.Count }).ToList(),
                PreferredThemes = themes.Select(t => new PatternItem { Name = t.Name, Count = t.Count }).ToList(),
                BestTimesOfDay = times.Select(t => new TimePatternItem
                {
                    TimeOfDay = t.TimeOfDay,
                    Count = t.Count,
                    AverageCompletion = t.AverageCompletion
                }).ToList()
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation patterns for user: {UserId}", userId);
            throw;
        }
    }

    public async Task<MeditationStatsDto> GetUserStatsAsync(Guid userId)
    {
        try
        {
            _logger.LogInformation("Retrieving meditation stats for user: {UserId} using Entity Framework", userId);

            var stats = await _context.MeditationAnalytics
                .Where(a => a.UserId == userId)
                .GroupBy(a => a.UserId)
                .Select(g => new MeditationStatsDto
                {
                    TotalSessions = g.Count(),
                    CompletedSessions = g.Count(a => a.Completed),
                    TotalMinutes = (int)(g.Sum(a => (a.DurationSeconds ?? 0)) / 60),
                    AverageCompletionPercentage = g.Average(a => (double?)a.CompletionPercentage) ?? 0,
                    AverageRating = g.Average(a => (double?)a.UserRating) ?? 0,
                    AverageMoodImprovement = g.Average(a => (double?)(a.EmotionalStateAfterScore - a.EmotionalStateBeforeScore)) ?? 0
                })
                .FirstOrDefaultAsync();

            if (stats == null)
            {
                _logger.LogInformation("No meditation stats found for user {UserId}, returning default stats", userId);
                return new MeditationStatsDto();
            }

            return stats;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving meditation stats for user: {UserId}", userId);
            throw;
        }
    }
}

