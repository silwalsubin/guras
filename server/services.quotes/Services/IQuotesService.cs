using services.quotes.Domain;

namespace services.quotes.Services;

public interface IQuotesService
{
    QuoteData GetRandomQuote();
    List<QuoteData> GetAllQuotes();
    QuoteData? GetQuoteByCategory(string category);
    List<QuoteData> GetQuotesByCategory(string category);
}
