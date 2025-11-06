using Microsoft.Extensions.Logging;
using services.quotes.Domain;
using services.quotes.Repositories;
using services.quotes.Services;

namespace services.quotes.Services;

public class QuotesService : IQuotesService
{
    private readonly IQuoteRepository _repository;
    private readonly ILogger<QuotesService> _logger;

    public QuotesService(IQuoteRepository repository, ILogger<QuotesService> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<QuoteData> GetRandomQuote()
    {
        try
        {
            var quotes = await _repository.GetAllAsync();
            if (quotes.Count == 0)
            {
                _logger.LogWarning("No quotes found in database");
                throw new InvalidOperationException("No quotes available");
            }

            var random = new Random();
            var quote = quotes[random.Next(quotes.Count)];
            _logger.LogInformation("Selected random quote: \"{QuoteText}\" by {Author}", quote.Text, quote.Author);
            return quote.ToQuoteData();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving random quote");
            throw;
        }
    }

    public async Task<List<QuoteData>> GetAllQuotes()
    {
        try
        {
            var quotes = await _repository.GetAllAsync();
            return quotes.Select(q => q.ToQuoteData()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all quotes");
            throw;
        }
    }

    public async Task<QuoteData?> GetQuoteByCategory(string category)
    {
        try
        {
            var quote = await _repository.GetByCategoryAsync(category);

            if (quote != null)
            {
                _logger.LogInformation("Found quote for category '{Category}': \"{QuoteText}\" by {Author}",
                    category, quote.Text, quote.Author);
                return quote.ToQuoteData();
            }
            else
            {
                _logger.LogWarning("No quote found for category: {Category}", category);
                return null;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quote by category: {Category}", category);
            throw;
        }
    }

    public async Task<List<QuoteData>> GetQuotesByCategory(string category)
    {
        try
        {
            var quotes = await _repository.GetByCategoryListAsync(category);
            _logger.LogInformation("Found {Count} quotes for category '{Category}'", quotes.Count, category);
            return quotes.Select(q => q.ToQuoteData()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quotes by category: {Category}", category);
            throw;
        }
    }
}
