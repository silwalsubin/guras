using Moq;
using Xunit;
using FluentAssertions;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using services.ai.Services;
using services.meditation.Services;
using services.meditation.Domain;

namespace tests.services.meditation;

public class MeditationRecommendationServiceTests
{
    private readonly Mock<IMeditationAnalyticsService> _mockAnalyticsService;
    private readonly Mock<ISpiritualAIService> _mockAIService;
    private readonly Mock<ILogger<MeditationRecommendationService>> _mockLogger;
    private readonly IMemoryCache _memoryCache;
    private readonly MeditationRecommendationService _service;

    public MeditationRecommendationServiceTests()
    {
        _mockAnalyticsService = new Mock<IMeditationAnalyticsService>();
        _mockAIService = new Mock<ISpiritualAIService>();
        _mockLogger = new Mock<ILogger<MeditationRecommendationService>>();
        _memoryCache = new MemoryCache(new MemoryCacheOptions());
        
        _service = new MeditationRecommendationService(
            _mockAnalyticsService.Object,
            _mockAIService.Object,
            _mockLogger.Object,
            _memoryCache
        );
    }

    #region GenerateRecommendationsAsync Tests

    [Fact]
    public async Task GenerateRecommendationsAsync_ShouldReturnCachedRecommendations_WhenCacheExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var cachedRecommendations = new List<MeditationRecommendationDto>
        {
            new() { Title = "Morning Mindfulness", Theme = "mindfulness", Difficulty = "beginner", Duration = 10 },
            new() { Title = "Stress Relief", Theme = "stress-relief", Difficulty = "intermediate", Duration = 15 }
        };

        var cacheKey = $"meditation_recommendations_{userId}";
        _memoryCache.Set(cacheKey, cachedRecommendations, TimeSpan.FromHours(1));

        // Act
        var result = await _service.GenerateRecommendationsAsync(userId, 2);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result.Should().BeEquivalentTo(cachedRecommendations);
        _mockAIService.Verify(x => x.GenerateRecommendationAsync(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task GenerateRecommendationsAsync_ShouldCallAIService_WhenCacheDoesNotExist()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var patterns = new MeditationPatternsDto
        {
            PreferredTeachers = new List<PatternItem> { new() { Name = "Osho", Count = 5 } },
            PreferredThemes = new List<PatternItem> { new() { Name = "mindfulness", Count = 3 } },
            BestTimesOfDay = new List<TimePatternItem> { new() { TimeOfDay = "morning", Count = 4 } }
        };

        var stats = new MeditationStatsDto
        {
            TotalSessions = 10,
            CompletedSessions = 8,
            TotalMinutes = 150,
            AverageCompletionPercentage = 85,
            AverageRating = 4.5,
            AverageMoodImprovement = 2.5
        };

        _mockAnalyticsService.Setup(x => x.GetUserPatternsAsync(userId))
            .ReturnsAsync(patterns);
        _mockAnalyticsService.Setup(x => x.GetUserStatsAsync(userId))
            .ReturnsAsync(stats);
        _mockAIService.Setup(x => x.GenerateRecommendationAsync(It.IsAny<string>()))
            .ReturnsAsync(GetMockAIResponse());

        // Act
        var result = await _service.GenerateRecommendationsAsync(userId, 3);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        _mockAIService.Verify(x => x.GenerateRecommendationAsync(It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task GenerateRecommendationsAsync_ShouldReturnFallbackRecommendations_WhenAIServiceFails()
    {
        // Arrange
        var userId = Guid.NewGuid();

        _mockAnalyticsService.Setup(x => x.GetUserPatternsAsync(userId))
            .ReturnsAsync(new MeditationPatternsDto());
        _mockAnalyticsService.Setup(x => x.GetUserStatsAsync(userId))
            .ReturnsAsync(new MeditationStatsDto());
        _mockAnalyticsService.Setup(x => x.GetUserHistoryAsync(userId, It.IsAny<int>()))
            .ReturnsAsync(new List<MeditationAnalyticsDto>());
        _mockAIService.Setup(x => x.GenerateRecommendationAsync(It.IsAny<string>()))
            .ThrowsAsync(new Exception("AI Service Error"));

        // Act
        var result = await _service.GenerateRecommendationsAsync(userId, 3);

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(3);
        result.Should().AllSatisfy(r => r.Title.Should().NotBeNullOrEmpty());
    }

    #endregion

    #region GetRecommendationReasonAsync Tests

    [Fact]
    public async Task GetRecommendationReasonAsync_ShouldReturnReason_WhenSessionTitleProvided()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var sessionTitle = "Morning Mindfulness";

        var patterns = new MeditationPatternsDto
        {
            PreferredThemes = new List<PatternItem>
            {
                new() { Name = "mindfulness", Count = 5 }
            }
        };

        var stats = new MeditationStatsDto { TotalSessions = 5 };

        _mockAnalyticsService.Setup(x => x.GetUserPatternsAsync(userId))
            .ReturnsAsync(patterns);
        _mockAnalyticsService.Setup(x => x.GetUserStatsAsync(userId))
            .ReturnsAsync(stats);

        // Act
        var result = await _service.GetRecommendationReasonAsync(userId, sessionTitle);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("mindfulness");
    }

    #endregion

    #region Helper Methods

    private static string GetMockAIResponse()
    {
        return @"[
            {
                ""title"": ""Morning Mindfulness"",
                ""theme"": ""mindfulness"",
                ""difficulty"": ""beginner"",
                ""duration"": 10,
                ""reason"": ""Based on your morning preference""
            },
            {
                ""title"": ""Stress Relief"",
                ""theme"": ""stress-relief"",
                ""difficulty"": ""intermediate"",
                ""duration"": 15,
                ""reason"": ""Matches your favorite sessions""
            },
            {
                ""title"": ""Sleep Meditation"",
                ""theme"": ""sleep"",
                ""difficulty"": ""beginner"",
                ""duration"": 20,
                ""reason"": ""Perfect for evening relaxation""
            }
        ]";
    }

    #endregion
}

