using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using services.quotes.Services;
using services.quotes.Domain;
using utilities.Controllers;
using Microsoft.AspNetCore.Authorization;

namespace services.quotes.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotesController : BaseController
{
    private readonly IQuotesService _quotesService;
    private readonly ILogger<QuotesController> _logger;

    public QuotesController(IQuotesService quotesService, ILogger<QuotesController> logger)
    {
        _quotesService = quotesService;
        _logger = logger;
    }

    /// <summary>
    /// Get all available quotes
    /// </summary>
    /// <returns>List of all quotes</returns>
    [HttpGet]
    public async Task<ActionResult<List<QuoteData>>> GetAllQuotes()
    {
        try
        {
            var quotes = await _quotesService.GetAllQuotes();
            _logger.LogInformation("Retrieved {Count} quotes", quotes.Count);
            return Ok(quotes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all quotes");
            return StatusCode(500, "An error occurred while retrieving quotes");
        }
    }

    /// <summary>
    /// Get a random quote
    /// </summary>
    /// <returns>A random quote</returns>
    [HttpGet("random")]
    public async Task<ActionResult<QuoteData>> GetRandomQuote()
    {
        try
        {
            var quote = await _quotesService.GetRandomQuote();
            _logger.LogInformation("Retrieved random quote: \"{QuoteText}\" by {Author}", quote.Text, quote.Author);
            return Ok(quote);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving random quote");
            return StatusCode(500, "An error occurred while retrieving random quote");
        }
    }

    /// <summary>
    /// Get quotes by category
    /// </summary>
    /// <param name="category">The category to filter by</param>
    /// <returns>List of quotes in the specified category</returns>
    [HttpGet("category/{category}")]
    public async Task<ActionResult<List<QuoteData>>> GetQuotesByCategory(string category)
    {
        try
        {
            var quotes = await _quotesService.GetQuotesByCategory(category);
            _logger.LogInformation("Retrieved {Count} quotes for category '{Category}'", quotes.Count, category);
            return Ok(quotes);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quotes for category '{Category}'", category);
            return StatusCode(500, "An error occurred while retrieving quotes by category");
        }
    }

    /// <summary>
    /// Get a single quote by category
    /// </summary>
    /// <param name="category">The category to filter by</param>
    /// <returns>A quote from the specified category or null if not found</returns>
    [HttpGet("category/{category}/single")]
    public async Task<ActionResult<QuoteData?>> GetQuoteByCategory(string category)
    {
        try
        {
            var quote = await _quotesService.GetQuoteByCategory(category);
            if (quote == null)
            {
                _logger.LogWarning("No quote found for category: {Category}", category);
                return NotFound($"No quote found for category: {category}");
            }

            _logger.LogInformation("Retrieved quote for category '{Category}': \"{QuoteText}\" by {Author}",
                category, quote.Text, quote.Author);
            return Ok(quote);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quote for category '{Category}'", category);
            return StatusCode(500, "An error occurred while retrieving quote by category");
        }
    }

    /// <summary>
    /// Get an AI-recommended quote for the user
    /// </summary>
    /// <returns>A quote recommended by AI based on user context</returns>
    [Authorize]
    [HttpGet("ai-recommended")]
    public async Task<IActionResult> GetAIRecommendedQuote()
    {
        try
        {
            _logger.LogInformation("Fetching AI-recommended quote for user");

            // Get a random quote as the AI recommendation
            // In a production system, this would use actual AI to select based on user context
            var quote = await _quotesService.GetRandomQuote();

            var recommendedQuote = new AIRecommendedQuoteDto
            {
                Text = quote.Text,
                Author = quote.Author,
                Category = quote.Category,
                Reason = GenerateRecommendationReason(quote.Category),
                IsAIRecommended = true
            };

            _logger.LogInformation("AI-recommended quote: \"{QuoteText}\" by {Author}", quote.Text, quote.Author);
            return SuccessResponse(recommendedQuote);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving AI-recommended quote");
            return ErrorResponse("An error occurred while retrieving AI-recommended quote", 500);
        }
    }

    private string GenerateRecommendationReason(string category)
    {
        return category switch
        {
            "inner-peace" => "This quote aligns with your journey toward inner peace",
            "mindfulness" => "Perfect for cultivating mindfulness in your daily practice",
            "meditation" => "A gentle reminder about the nature of meditation",
            "self-love" => "Encouraging you to embrace self-compassion",
            "awareness" => "Deepening your awareness and presence",
            "happiness" => "Inspiring true happiness from within",
            "inspiration" => "A spark of inspiration for your day",
            _ => "A thoughtful reflection for your spiritual journey"
        };
    }
}

/// <summary>
/// DTO for AI-recommended quotes
/// </summary>
public class AIRecommendedQuoteDto
{
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Reason { get; set; } = string.Empty;
    public bool IsAIRecommended { get; set; } = true;
}
