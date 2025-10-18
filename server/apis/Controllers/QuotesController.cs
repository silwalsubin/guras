using Microsoft.AspNetCore.Mvc;
using services.quotes.Services;
using services.quotes.Domain;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuotesController : ControllerBase
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
    public ActionResult<List<QuoteData>> GetAllQuotes()
    {
        try
        {
            var quotes = _quotesService.GetAllQuotes();
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
    public ActionResult<QuoteData> GetRandomQuote()
    {
        try
        {
            var quote = _quotesService.GetRandomQuote();
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
    public ActionResult<List<QuoteData>> GetQuotesByCategory(string category)
    {
        try
        {
            var quotes = _quotesService.GetQuotesByCategory(category);
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
    public ActionResult<QuoteData?> GetQuoteByCategory(string category)
    {
        try
        {
            var quote = _quotesService.GetQuoteByCategory(category);
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
}
