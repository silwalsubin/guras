using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using utilities.ai.Domain;
using utilities.ai.Services;
using utilities.Controllers;

namespace utilities.ai.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SpiritualAIController : BaseController
{
    private readonly ISpiritualAIService _aiService;
    private readonly ILogger<SpiritualAIController> _logger;

    public SpiritualAIController(ISpiritualAIService aiService, ILogger<SpiritualAIController> logger)
    {
        _aiService = aiService;
        _logger = logger;
    }

    /// <summary>
    /// Generate AI response from a spiritual teacher
    /// </summary>
    /// <param name="request">AI request with question and context</param>
    /// <returns>AI-generated response from the spiritual teacher</returns>
    [HttpPost("generate-response")]
    [Authorize]
    public async Task<IActionResult> GenerateResponse([FromBody] AIRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Question))
            {
                return BadRequest("Question is required");
            }

            if (string.IsNullOrWhiteSpace(request.TeacherId))
            {
                return BadRequest("Teacher ID is required");
            }

            _logger.LogInformation("Generating AI response for teacher {TeacherId}", request.TeacherId);

            var response = await _aiService.GenerateResponseAsync(request);

            _logger.LogInformation("AI response generated successfully in {ProcessingTime}ms", response.ProcessingTimeMs);

            return SuccessResponse(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid request for AI response generation");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI response");
            return ErrorResponse("An error occurred while generating the AI response", 500);
        }
    }

    /// <summary>
    /// Generate daily spiritual guidance
    /// </summary>
    /// <param name="teacherId">ID of the spiritual teacher</param>
    /// <param name="userId">ID of the user requesting guidance</param>
    /// <returns>Daily spiritual guidance</returns>
    [HttpPost("daily-guidance")]
    [Authorize]
    public async Task<IActionResult> GenerateDailyGuidance([FromQuery] string teacherId, [FromQuery] string userId)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(teacherId))
            {
                return BadRequest("Teacher ID is required");
            }

            if (string.IsNullOrWhiteSpace(userId))
            {
                return BadRequest("User ID is required");
            }

            _logger.LogInformation("Generating daily guidance for user {UserId} from teacher {TeacherId}", userId, teacherId);

            var response = await _aiService.GenerateDailyGuidanceAsync(teacherId, userId);

            _logger.LogInformation("Daily guidance generated successfully in {ProcessingTime}ms", response.ProcessingTimeMs);

            return SuccessResponse(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating daily guidance");
            return ErrorResponse("An error occurred while generating daily guidance", 500);
        }
    }

    /// <summary>
    /// Check if AI service is available
    /// </summary>
    /// <returns>Service availability status</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckHealth()
    {
        try
        {
            var isAvailable = await _aiService.IsServiceAvailableAsync();
            var stats = await _aiService.GetServiceStatsAsync();

            return SuccessResponse(new
            {
                isAvailable,
                stats,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking AI service health");
            return ErrorResponse("An error occurred while checking service health", 500);
        }
    }

    /// <summary>
    /// Get AI service statistics
    /// </summary>
    /// <returns>Service statistics and configuration</returns>
    [HttpGet("stats")]
    [Authorize]
    public async Task<IActionResult> GetStats()
    {
        try
        {
            var stats = await _aiService.GetServiceStatsAsync();
            return SuccessResponse(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting AI service stats");
            return ErrorResponse("An error occurred while getting service statistics", 500);
        }
    }
}
