using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.journal.Requests;
using services.journal.Services;
using services.ai.Services;
using utilities.Controllers;

namespace services.journal.Controllers;

/// <summary>
/// Controller for journal entry operations
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JournalController(IJournalEntryService journalEntryService, ISpiritualAIService aiService, ILogger<JournalController> logger) : BaseController
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
                return UnauthorizedResponse("Application user ID not found in token");
            }

            if (page < 1) page = 1;
            if (pageSize < 1 || pageSize > 100) pageSize = 20;

            logger.LogInformation("Fetching journal entries for user: {UserId}, page: {Page}, pageSize: {PageSize}, search: {Search}", userId, page, pageSize, search);

            var entries = await journalEntryService.GetByUserIdAsync(userId, page, pageSize, search);
            return SuccessResponse(entries);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error fetching journal entries");
            return ErrorResponse("Failed to fetch journal entries", 500);
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

    /// <summary>
    /// Generate personalized spiritual guidance based on recent journal entries
    /// </summary>
    [HttpGet("guidance")]
    public async Task<IActionResult> GetPersonalizedGuidance([FromQuery] int entryCount = 5)
    {
        try
        {
            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Application user ID not found in token");
            }

            if (entryCount < 1 || entryCount > 10)
            {
                return BadRequest(new { Error = "Entry count must be between 1 and 10" });
            }

            logger.LogInformation("Generating personalized guidance for user: {UserId} using {EntryCount} entries", userId, entryCount);

            // Fetch recent journal entries
            var entries = await journalEntryService.GetByUserIdAsync(userId, 1, entryCount);

            if (!entries.Any())
            {
                return Ok(new {
                    guidance = "Start journaling to receive personalized spiritual guidance.",
                    quote = "Every journey begins with a single step.",
                    hasEntries = false
                });
            }

            // Build context from entries
            var entriesText = string.Join("\n\n", entries.Select(e => $"Title: {e.Title}\nMood: {e.Mood}\nContent: {e.Content}"));
            var moods = entries.Where(e => !string.IsNullOrEmpty(e.Mood)).Select(e => e.Mood).ToList();
            var moodSummary = moods.Any() ? string.Join(", ", moods.Distinct()) : "neutral";

            // Create prompt for AI to generate personalized guidance
            var prompt = $@"Based on the following recent journal entries from a user, generate personalized spiritual guidance that feels like advice from a caring friend.

Recent Journal Entries:
{entriesText}

Detected Moods: {moodSummary}

Please provide:
1. A relevant spiritual quote that resonates with their current emotional state
2. Compassionate guidance or motivation addressing their current condition (2-3 sentences)
3. A supportive message that feels like advice from a caring friend (2-3 sentences)

IMPORTANT: Respond ONLY with valid JSON (no markdown, no code blocks, no additional text). Use this exact format:
{{
  ""quote"": ""the quote here"",
  ""guidance"": ""the guidance here"",
  ""supportiveMessage"": ""the supportive message here""
}}";

            // Call AI service to generate guidance
            var aiResponse = await aiService.GenerateRecommendationAsync(prompt);

            logger.LogInformation("Successfully generated personalized guidance for user: {UserId}", userId);
            logger.LogInformation("AI Response: {Response}", aiResponse);

            // Parse the AI response as JSON to extract structured guidance
            object parsedGuidance;
            try
            {
                // Clean up the response - remove markdown code blocks if present
                var cleanedResponse = aiResponse;
                if (cleanedResponse.Contains("```json"))
                {
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"```json\s*", "");
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"\s*```", "");
                }
                else if (cleanedResponse.Contains("```"))
                {
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"```\s*", "");
                    cleanedResponse = System.Text.RegularExpressions.Regex.Replace(cleanedResponse, @"\s*```", "");
                }

                cleanedResponse = cleanedResponse.Trim();

                // Try to parse as JSON
                var parsed = Newtonsoft.Json.JsonConvert.DeserializeObject<dynamic>(cleanedResponse);

                // Ensure we have the required fields
                if (parsed != null)
                {
                    parsedGuidance = new
                    {
                        quote = parsed["quote"]?.ToString() ?? "Every moment is a fresh beginning.",
                        guidance = parsed["guidance"]?.ToString() ?? "Trust your journey.",
                        supportiveMessage = parsed["supportiveMessage"]?.ToString() ?? "You are on a beautiful path of self-discovery."
                    };
                }
                else
                {
                    parsedGuidance = new
                    {
                        quote = "Every moment is a fresh beginning.",
                        guidance = aiResponse,
                        supportiveMessage = "Your reflections are valuable and meaningful."
                    };
                }
            }
            catch (Exception parseEx)
            {
                // If parsing fails, return the raw response as guidance
                logger.LogWarning(parseEx, "Failed to parse AI response as JSON, using raw response");
                parsedGuidance = new
                {
                    quote = "Every moment is a fresh beginning.",
                    guidance = aiResponse,
                    supportiveMessage = "Your reflections are valuable and meaningful."
                };
            }

            return Ok(new {
                guidance = parsedGuidance,
                hasEntries = true,
                entriesAnalyzed = entries.Count(),
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating personalized guidance");
            return StatusCode(500, new { Error = "Failed to generate personalized guidance" });
        }
    }
}

