using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.ai.Services;
using utilities.Controllers;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AITestController : BaseController
{
    private readonly ISpiritualAIService _aiService;
    private readonly ILogger<AITestController> _logger;

    public AITestController(ISpiritualAIService aiService, ILogger<AITestController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Simple AI test endpoint - no authentication required
    /// </summary>
    /// <param name="message">Test message to send to AI</param>
    /// <returns>AI response</returns>
    [HttpPost("chat")]
    [AllowAnonymous]
    public async Task<IActionResult> TestChat([FromBody] TestChatRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequestResponse("Message is required");
            }

            _logger.LogInformation("AI Test - Processing message: {Message}", request.Message);

            // Create a simple AI request
            var aiRequest = new services.ai.Domain.AIRequest
            {
                Question = request.Message,
                TeacherId = "osho", // Default to Osho for testing
                UserLevel = "beginner",
                CurrentChallenges = new[] { "testing" },
                SpiritualGoals = new[] { "learning" },
                RecentInsights = new string[0],
                PracticeHistory = new string[0],
                EmotionalState = "curious",
                ConversationHistory = new string[0]
            };

            var response = await _aiService.GenerateResponseAsync(aiRequest);

            _logger.LogInformation("AI Test - Response generated successfully in {ProcessingTime}ms", response.ProcessingTimeMs);

            return SuccessResponse(new
            {
                message = request.Message,
                response = response.Response,
                source = response.Source,
                confidence = response.Confidence,
                processingTimeMs = response.ProcessingTimeMs,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI Test - Error processing message: {Message}", request.Message);
            return ErrorResponse($"AI test failed: {ex.Message}", 500);
        }
    }

    /// <summary>
    /// Test AI service health
    /// </summary>
    /// <returns>Service health status</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> TestHealth()
    {
        try
        {
            var isAvailable = await _aiService.IsServiceAvailableAsync();
            var stats = await _aiService.GetServiceStatsAsync();

            return SuccessResponse(new
            {
                isAvailable,
                stats,
                timestamp = DateTime.UtcNow,
                message = isAvailable ? "AI service is working!" : "AI service is not available"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI Test - Error checking health");
            return ErrorResponse($"Health check failed: {ex.Message}", 500);
        }
    }

    /// <summary>
    /// Simple ping test
    /// </summary>
    /// <returns>Pong response</returns>
    [HttpGet("ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return SuccessResponse(new
        {
            message = "AI Test Controller is alive!",
            timestamp = DateTime.UtcNow
        });
    }
}

public class TestChatRequest
{
    public string Message { get; set; } = string.Empty;
}
