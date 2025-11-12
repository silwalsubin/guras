using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using orchestration.journals.Services;
using utilities.Controllers;

namespace orchestration.journals.Controllers;

/// <summary>
/// Controller for journal entry operations with emotions orchestration
/// </summary>
[ApiController]
[Route("api/journal-orchestration")]
[Authorize]
public class JournalOrchestrationController(IJournalOrchestrationService journalOrchestrationService, ILogger<JournalOrchestrationController> logger) : BaseController
{
    /// <summary>
    /// Get all journal entries for the current user with emotions
    /// </summary>
    [HttpGet("entries")]
    public async Task<IActionResult> GetEntries([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return UnauthorizedResponse("Application user ID not found in token");
            }

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            logger.LogInformation("Fetching journal entries with emotions for user: {UserId}, page: {Page}, pageSize: {PageSize}", userId, page, pageSize);

            var entries = await journalOrchestrationService.GetUserJournalEntriesWithEmotionsAsync(userId);
            return SuccessResponse(entries);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching journal entries with emotions");
            return ErrorResponse("Failed to fetch journal entries", 500);
        }
    }

    /// <summary>
    /// Get a specific journal entry by ID with emotions
    /// </summary>
    [HttpGet("entries/{id}")]
    public async Task<IActionResult> GetEntry(Guid id)
    {
        try
        {
            logger.LogInformation("Fetching journal entry with emotions: {JournalEntryId}", id);

            var entry = await journalOrchestrationService.GetJournalEntryWithEmotionsAsync(id);
            if (entry == null)
            {
                return NotFoundResponse("Journal entry not found");
            }

            return SuccessResponse(entry);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching journal entry with emotions: {JournalEntryId}", id);
            return ErrorResponse("Failed to fetch journal entry", 500);
        }
    }

    /// <summary>
    /// Create a new journal entry with emotions
    /// </summary>
    [HttpPost("entries")]
    public async Task<IActionResult> CreateEntry([FromBody] CreateJournalEntryWithEmotionsRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Error = "Content is required" });
            }

            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Application user ID not found in token");
            }

            logger.LogInformation("Creating journal entry with emotions for user: {UserId}", userId);

            var entry = await journalOrchestrationService.CreateJournalEntryWithEmotionsAsync(
                userId,
                request.Content
            );

            return SuccessResponse(entry);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating journal entry with emotions");
            return ErrorResponse("Failed to create journal entry", 500);
        }
    }

    /// <summary>
    /// Update a journal entry with emotions
    /// </summary>
    [HttpPut("entries/{id}")]
    public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] UpdateJournalEntryWithEmotionsRequest request)
    {
        try
        {
            logger.LogInformation("Updating journal entry with emotions: {JournalEntryId}", id);

            // For now, we'll need to implement update in the orchestration service
            // This is a placeholder - you may need to extend the orchestration service
            return BadRequest(new { Error = "Update not yet implemented in orchestration layer" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating journal entry with emotions: {JournalEntryId}", id);
            return ErrorResponse("Failed to update journal entry", 500);
        }
    }

    /// <summary>
    /// Delete a journal entry (soft delete)
    /// </summary>
    [HttpDelete("entries/{id}")]
    public async Task<IActionResult> DeleteEntry(Guid id)
    {
        try
        {
            logger.LogInformation("Deleting journal entry: {JournalEntryId}", id);

            // For now, we'll need to implement delete in the orchestration service
            // This is a placeholder - you may need to extend the orchestration service
            return BadRequest(new { Error = "Delete not yet implemented in orchestration layer" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting journal entry: {JournalEntryId}", id);
            return ErrorResponse("Failed to delete journal entry", 500);
        }
    }

    /// <summary>
    /// Analyze journal content and determine which emotions best describe it using AI
    /// </summary>
    [HttpPost("analyze-emotions")]
    public async Task<IActionResult> AnalyzeEmotions([FromBody] AnalyzeEmotionsRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Content))
            {
                return BadRequest(new { Error = "Content is required" });
            }

            logger.LogInformation("Analyzing emotions for journal content");

            var emotionIds = await journalOrchestrationService.AnalyzeJournalEmotionsAsync(request.Content);
            return SuccessResponse(new { emotionIds });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error analyzing emotions");
            return ErrorResponse("Failed to analyze emotions", 500);
        }
    }
}

/// <summary>
/// Request model for creating a journal entry with emotions
/// </summary>
public class CreateJournalEntryWithEmotionsRequest
{
    public string Content { get; set; } = string.Empty;
}

/// <summary>
/// Request model for updating a journal entry with emotions
/// </summary>
public class UpdateJournalEntryWithEmotionsRequest
{
    public string? Content { get; set; }
}

/// <summary>
/// Request model for analyzing emotions in journal content
/// </summary>
public class AnalyzeEmotionsRequest
{
    public string Content { get; set; } = string.Empty;
}

