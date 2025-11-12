using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.journal.Requests;
using services.journal.Services;
using utilities.ai.Services;
using utilities.Controllers;

namespace services.journal.Controllers;

/// <summary>
/// Controller for journal entry operations
/// NOTE: CRUD operations have been moved to orchestration.journals layer
/// This controller now only handles guidance generation
/// </summary>
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class JournalController(IJournalEntryService journalEntryService, ISpiritualAIService aiService, ILogger<JournalController> logger) : BaseController
{
    /// <summary>
    /// DEPRECATED: Use /api/journal-orchestration/entries instead
    /// </summary>
    [HttpPost("entries")]
    [Obsolete("Use POST /api/journal-orchestration/entries instead")]
    public IActionResult CreateEntry([FromBody] CreateJournalEntryRequest request)
    {
        return StatusCode(410, new { Error = "This endpoint has been moved to /api/journal-orchestration/entries" });
    }

    /// <summary>
    /// DEPRECATED: Use /api/journal-orchestration/entries instead
    /// </summary>
    [HttpGet("entries")]
    [Obsolete("Use GET /api/journal-orchestration/entries instead")]
    public IActionResult GetEntries([FromQuery] int page = 1, [FromQuery] int pageSize = 20, [FromQuery] string? search = null)
    {
        return StatusCode(410, new { Error = "This endpoint has been moved to /api/journal-orchestration/entries" });
    }

    /// <summary>
    /// DEPRECATED: Use /api/journal-orchestration/entries/{id} instead
    /// </summary>
    [HttpGet("entries/{id}")]
    [Obsolete("Use GET /api/journal-orchestration/entries/{id} instead")]
    public IActionResult GetEntry(Guid id)
    {
        return StatusCode(410, new { Error = "This endpoint has been moved to /api/journal-orchestration/entries/{id}" });
    }

    /// <summary>
    /// DEPRECATED: Use /api/journal-orchestration/entries/{id} instead
    /// </summary>
    [HttpPut("entries/{id}")]
    [Obsolete("Use PUT /api/journal-orchestration/entries/{id} instead")]
    public IActionResult UpdateEntry(Guid id, [FromBody] UpdateJournalEntryRequest request)
    {
        return StatusCode(410, new { Error = "This endpoint has been moved to /api/journal-orchestration/entries/{id}" });
    }

    /// <summary>
    /// DEPRECATED: Use /api/journal-orchestration/entries/{id} instead
    /// </summary>
    [HttpDelete("entries/{id}")]
    [Obsolete("Use DELETE /api/journal-orchestration/entries/{id} instead")]
    public IActionResult DeleteEntry(Guid id)
    {
        return StatusCode(410, new { Error = "This endpoint has been moved to /api/journal-orchestration/entries/{id}" });
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
            var entriesText = string.Join("\n\n", entries.Select(e => $"Title: {e.Title}\nContent: {e.Content}"));

            // Create prompt for AI to generate personalized guidance
            var prompt = $@"Based on the following recent journal entries from a user, generate personalized spiritual guidance that feels like advice from a caring friend.

Recent Journal Entries:
{entriesText}

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

