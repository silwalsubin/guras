using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.emotions.Domain;
using services.emotions.Services;
using utilities.Controllers;

namespace services.emotions.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmotionsController : BaseController
{
    private readonly IEmotionService _emotionService;
    private readonly ILogger<EmotionsController> _logger;

    public EmotionsController(IEmotionService emotionService, ILogger<EmotionsController> logger)
    {
        _emotionService = emotionService;
        _logger = logger;
    }

    /// <summary>
    /// Get all emotions
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAllEmotions()
    {
        try
        {
            _logger.LogInformation("Getting all emotions");
            var emotions = await _emotionService.GetAllEmotionsAsync();
            return SuccessResponse(emotions);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting all emotions");
            return ErrorResponse("An error occurred while retrieving emotions", 500);
        }
    }

    /// <summary>
    /// Get emotion by ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<IActionResult> GetEmotionById(string id)
    {
        try
        {
            _logger.LogInformation("Getting emotion by ID: {EmotionId}", id);
            var emotion = await _emotionService.GetEmotionByIdAsync(id);

            if (emotion == null)
            {
                return NotFoundResponse("Emotion not found");
            }

            return SuccessResponse(emotion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting emotion by ID: {EmotionId}", id);
            return ErrorResponse("An error occurred while retrieving the emotion", 500);
        }
    }

    /// <summary>
    /// Get emotion by name
    /// </summary>
    [HttpGet("by-name/{name}")]
    public async Task<IActionResult> GetEmotionByName(string name)
    {
        try
        {
            _logger.LogInformation("Getting emotion by name: {EmotionName}", name);
            var emotion = await _emotionService.GetEmotionByNameAsync(name);

            if (emotion == null)
            {
                return NotFoundResponse("Emotion not found");
            }

            return SuccessResponse(emotion);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting emotion by name: {EmotionName}", name);
            return ErrorResponse("An error occurred while retrieving the emotion", 500);
        }
    }

    /// <summary>
    /// Get color for an emotion
    /// </summary>
    [HttpGet("{emotionName}/color")]
    public async Task<IActionResult> GetEmotionColor(string emotionName)
    {
        try
        {
            _logger.LogInformation("Getting color for emotion: {EmotionName}", emotionName);
            var color = await _emotionService.GetEmotionColorAsync(emotionName);

            if (color == null)
            {
                return NotFoundResponse("Emotion not found");
            }

            return SuccessResponse(color);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting color for emotion: {EmotionName}", emotionName);
            return ErrorResponse("An error occurred while retrieving the color", 500);
        }
    }
}

