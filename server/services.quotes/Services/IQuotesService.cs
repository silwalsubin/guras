using services.quotes.Domain;

namespace services.quotes.Services;

public interface IQuotesService
{
    Task<QuoteData> GetRandomQuote();
    Task<List<QuoteData>> GetAllQuotes();
    Task<QuoteData?> GetQuoteByCategory(string category);
    Task<List<QuoteData>> GetQuotesByCategory(string category);
}
