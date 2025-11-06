using services.quotes.Domain;
using services.quotes.Models;

namespace services.quotes.Services;

public static class QuoteMappingService
{
    public static QuoteEntity ToEntity(this Quote quote)
    {
        return new QuoteEntity
        {
            Id = quote.Id,
            Text = quote.Text,
            Author = quote.Author,
            Category = quote.Category,
            CreatedAt = quote.CreatedAt,
            UpdatedAt = quote.UpdatedAt
        };
    }

    public static Quote ToDomain(this QuoteEntity entity)
    {
        return new Quote
        {
            Id = entity.Id,
            Text = entity.Text,
            Author = entity.Author,
            Category = entity.Category,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public static QuoteData ToQuoteData(this Quote quote)
    {
        return new QuoteData
        {
            Text = quote.Text,
            Author = quote.Author,
            Category = quote.Category
        };
    }
}

