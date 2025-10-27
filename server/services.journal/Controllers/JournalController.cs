using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.journal.Requests;
using services.journal.Services;
using utilities.Controllers;

namespace services.journal.Controllers;

/// <summary>
/// Controller for journal entry operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JournalController(IJournalEntryService journalEntryService, ILogger<JournalController> logger) : BaseController
{
    /// <summary>
    /// Create a new journal entry
    /// </summary>
    [HttpPost("entries")]
    public async Task<IActionResult> CreateEntry([FromBody] CreateJournalEntryRequest request)
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

            logger.LogInformation("Creating journal entry for user: {UserId}", userId);

            var response = await journalEntryService.CreateAsync(userId, request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error creating journal entry");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get all journal entries for the current user
    /// </summary>
    [HttpGet("entries")]
    public async Task<IActionResult> GetEntries([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Application user ID not found in token");
            }

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            logger.LogInformation("Fetching journal entries for user: {UserId}, page: {Page}, pageSize: {PageSize}, search: {Search}", userId, page, pageSize, search);

            var entries = await journalEntryService.GetByUserIdAsync(userId, page, pageSize, search);
            return Ok(entries);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching journal entries");
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Get a specific journal entry by ID
    /// </summary>
    [HttpGet("entries/{id}")]
    public async Task<IActionResult> GetEntry(Guid id)
    {
        try
        {
            logger.LogInformation("Fetching journal entry: {JournalEntryId}", id);

            var entry = await journalEntryService.GetByIdAsync(id);
            if (entry == null)
            {
                return NotFound(new { Error = "Journal entry not found" });
            }

            return Ok(entry);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching journal entry: {JournalEntryId}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }

    /// <summary>
    /// Update a journal entry
    /// </summary>
    [HttpPut("entries/{id}")]
    public async Task<IActionResult> UpdateEntry(Guid id, [FromBody] UpdateJournalEntryRequest request)
    {
        try
        {
            logger.LogInformation("Updating journal entry: {JournalEntryId}", id);

            var entry = await journalEntryService.UpdateAsync(id, request);
            if (entry == null)
            {
                return NotFound(new { Error = "Journal entry not found" });
            }

            return Ok(entry);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating journal entry: {JournalEntryId}", id);
            return StatusCode(500, new { Error = "Internal server error" });
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

            var success = await journalEntryService.DeleteAsync(id);
            if (!success)
            {
                return NotFound(new { Error = "Journal entry not found" });
            }

            return Ok(new { Message = "Journal entry deleted successfully" });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting journal entry: {JournalEntryId}", id);
            return StatusCode(500, new { Error = "Internal server error" });
        }
    }
}

