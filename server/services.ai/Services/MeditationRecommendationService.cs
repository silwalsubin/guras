using services.ai.Domain;
using services.meditation.Services;
using services.meditation.Domain;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Caching.Memory;

namespace services.ai.Services;

/// <summary>
/// Service for generating AI-powered personalized meditation recommendations
/// </summary>
public interface IMeditationRecommendationService
{
    /// <summary>
    /// Generate personalized meditation recommendations for a user
    /// </summary>
    Task<List<MeditationRecommendationDto>> GenerateRecommendationsAsync(Guid userId, int count = 3);

    /// <summary>
    /// Get recommendation reason/explanation
    /// </summary>
    Task<string> GetRecommendationReasonAsync(Guid userId, string sessionTitle);
}

public class MeditationRecommendationService : IMeditationRecommendationService
{
    private readonly IMeditationAnalyticsService _analyticsService;
    private readonly ISpiritualAIService _aiService;
    private readonly ILogger<MeditationRecommendationService> _logger;
    private readonly IMemoryCache _cache;

    public MeditationRecommendationService(
        IMeditationAnalyticsService analyticsService,
        ISpiritualAIService aiService,
        ILogger<MeditationRecommendationService> logger,
        IMemoryCache cache)
    {
        _analyticsService = analyticsService;
        _aiService = aiService;
        _logger = logger;
        _cache = cache;
    }

    public async Task<List<MeditationRecommendationDto>> GenerateRecommendationsAsync(Guid userId, int count = 3)
    {
        try
        {
            // Check cache first
            var cacheKey = $"meditation_recommendations_{userId}";
            if (_cache.TryGetValue(cacheKey, out List<MeditationRecommendationDto>? cachedRecommendations))
            {
                _logger.LogInformation("Returning cached recommendations for user {UserId}", userId);
                return cachedRecommendations ?? new();
            }

            _logger.LogInformation("Generating recommendations for user {UserId}", userId);

            // Get user's meditation patterns and stats
            var patterns = await _analyticsService.GetUserPatternsAsync(userId);
            var stats = await _analyticsService.GetUserStatsAsync(userId);
            var history = await _analyticsService.GetUserHistoryAsync(userId, 20);

            // Build context for AI
            var context = BuildRecommendationContext(patterns, stats, history);

            // Generate recommendations using AI
            var recommendations = await GenerateRecommendationsWithAIAsync(context, count);

            // Cache for 1 hour
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromHours(1));
            _cache.Set(cacheKey, recommendations, cacheOptions);

            _logger.LogInformation("Generated {Count} recommendations for user {UserId}", recommendations.Count, userId);
            return recommendations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendations for user {UserId}", userId);
            throw;
        }
    }

    public async Task<string> GetRecommendationReasonAsync(Guid userId, string sessionTitle)
    {
        try
        {
            var patterns = await _analyticsService.GetUserPatternsAsync(userId);
            var stats = await _analyticsService.GetUserStatsAsync(userId);

            var reason = GenerateRecommendationReason(patterns, stats, sessionTitle);
            return reason;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating recommendation reason for user {UserId}", userId);
            return "Personalized for you";
        }
    }

    private RecommendationContext BuildRecommendationContext(
        MeditationPatternsDto patterns,
        MeditationStatsDto stats,
        List<MeditationAnalyticsDto> history)
    {
        return new RecommendationContext
        {
            TotalSessions = stats.TotalSessions,
            CompletedSessions = stats.CompletedSessions,
            CompletionRate = stats.TotalSessions > 0 ? (double)stats.CompletedSessions / stats.TotalSessions * 100 : 0,
            TotalMinutes = stats.TotalMinutes,
            AverageRating = stats.AverageRating,
            MoodImprovement = stats.AverageMoodImprovement,
            PreferredTeachers = patterns.PreferredTeachers.Select(t => t.Name).ToList(),
            PreferredThemes = patterns.PreferredThemes.Select(t => t.Name).ToList(),
            BestTimesOfDay = patterns.BestTimesOfDay.Select(t => t.TimeOfDay).ToList(),
            RecentSessions = history.Select(h => new RecentSessionInfo
            {
                Title = h.SessionTitle ?? "Unknown",
                Theme = h.MeditationTheme ?? "general",
                Duration = h.DurationSeconds ?? 0,
                Completed = h.Completed,
                Rating = h.UserRating ?? 0
            }).ToList()
        };
    }

    private async Task<List<MeditationRecommendationDto>> GenerateRecommendationsWithAIAsync(
        RecommendationContext context,
        int count)
    {
        try
        {
            // Build prompt for AI
            var prompt = BuildRecommendationPrompt(context, count);

            // Call AI service to generate recommendations
            var aiResponse = await _aiService.GenerateRecommendationAsync(prompt);

            // Parse AI response into recommendations
            var recommendations = ParseAIRecommendations(aiResponse, count);

            return recommendations;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling AI for recommendations");
            // Return default recommendations if AI fails
            return GetDefaultRecommendations(context, count);
        }
    }

    private string BuildRecommendationPrompt(RecommendationContext context, int count)
    {
        var preferredTeachers = string.Join(", ", context.PreferredTeachers.Take(3));
        var preferredThemes = string.Join(", ", context.PreferredThemes.Take(3));
        var bestTimes = string.Join(", ", context.BestTimesOfDay.Take(3));

        return $@"
Based on the user's meditation history, generate {count} personalized meditation session recommendations.

User Profile:
- Total Sessions: {context.TotalSessions}
- Completion Rate: {context.CompletionRate:F1}%
- Total Minutes Meditated: {context.TotalMinutes}
- Average Rating: {context.AverageRating:F1}/5
- Mood Improvement: {context.MoodImprovement:F1} points

Preferences:
- Favorite Teachers: {(string.IsNullOrEmpty(preferredTeachers) ? "None yet" : preferredTeachers)}
- Favorite Themes: {(string.IsNullOrEmpty(preferredThemes) ? "None yet" : preferredThemes)}
- Best Times: {(string.IsNullOrEmpty(bestTimes) ? "Any time" : bestTimes)}

Generate recommendations in JSON format:
[
  {{
    ""title"": ""Session Title"",
    ""theme"": ""meditation theme"",
    ""difficulty"": ""beginner/intermediate/advanced"",
    ""duration"": 10,
    ""reason"": ""Why this is recommended for the user""
  }}
]

Focus on:
1. Sessions matching user's preferred themes and teachers
2. Times when user is most likely to complete sessions
3. Gradual difficulty progression
4. Variety to keep engagement high

Return ONLY valid JSON array, no other text.";
    }

    private List<MeditationRecommendationDto> ParseAIRecommendations(string aiResponse, int count)
    {
        try
        {
            // Extract JSON from response
            var jsonStart = aiResponse.IndexOf('[');
            var jsonEnd = aiResponse.LastIndexOf(']') + 1;

            if (jsonStart < 0 || jsonEnd <= jsonStart)
            {
                _logger.LogWarning("Could not find JSON in AI response");
                return new();
            }

            var jsonString = aiResponse.Substring(jsonStart, jsonEnd - jsonStart);
            var recommendations = JsonSerializer.Deserialize<List<MeditationRecommendationDto>>(jsonString);

            return recommendations?.Take(count).ToList() ?? new();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error parsing AI recommendations");
            return new();
        }
    }

    private List<MeditationRecommendationDto> GetDefaultRecommendations(RecommendationContext context, int count)
    {
        var defaults = new List<MeditationRecommendationDto>
        {
            new()
            {
                Title = "Morning Mindfulness",
                Theme = "mindfulness",
                Difficulty = "beginner",
                Duration = 10,
                Reason = "Perfect for starting your day with clarity"
            },
            new()
            {
                Title = "Stress Relief",
                Theme = "stress-relief",
                Difficulty = "intermediate",
                Duration = 15,
                Reason = "Based on your meditation history"
            },
            new()
            {
                Title = "Deep Sleep",
                Theme = "sleep",
                Difficulty = "beginner",
                Duration = 20,
                Reason = "Evening meditation for better rest"
            }
        };

        return defaults.Take(count).ToList();
    }

    private string GenerateRecommendationReason(
        MeditationPatternsDto patterns,
        MeditationStatsDto stats,
        string sessionTitle)
    {
        if (stats.TotalSessions == 0)
            return "Great for beginners";

        if (patterns.PreferredTeachers.Any())
            return $"Based on your preference for {patterns.PreferredTeachers.First().Name}";

        if (patterns.PreferredThemes.Any())
            return $"Matches your favorite {patterns.PreferredThemes.First().Name} sessions";

        if (patterns.BestTimesOfDay.Any())
            return $"Perfect for {patterns.BestTimesOfDay.First().TimeOfDay}";

        return "Personalized for you";
    }
}

/// <summary>
/// Context for building recommendations
/// </summary>
public class RecommendationContext
{
    public int TotalSessions { get; set; }
    public int CompletedSessions { get; set; }
    public double CompletionRate { get; set; }
    public int TotalMinutes { get; set; }
    public double AverageRating { get; set; }
    public double MoodImprovement { get; set; }
    public List<string> PreferredTeachers { get; set; } = new();
    public List<string> PreferredThemes { get; set; } = new();
    public List<string> BestTimesOfDay { get; set; } = new();
    public List<RecentSessionInfo> RecentSessions { get; set; } = new();
}

public class RecentSessionInfo
{
    public string Title { get; set; } = string.Empty;
    public string Theme { get; set; } = string.Empty;
    public int Duration { get; set; }
    public bool Completed { get; set; }
    public int Rating { get; set; }
}

/// <summary>
/// DTO for meditation recommendations
/// </summary>
public class MeditationRecommendationDto
{
    public string Title { get; set; } = string.Empty;
    public string Theme { get; set; } = string.Empty;
    public string Difficulty { get; set; } = "beginner";
    public int Duration { get; set; } = 10;
    public string Reason { get; set; } = "Personalized for you";
}

