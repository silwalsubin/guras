using Microsoft.Extensions.Logging;
using services.quotes.Domain;

namespace services.quotes.Services;

public class QuotesService : IQuotesService
{
    private readonly ILogger<QuotesService> _logger;
    private readonly List<QuoteData> _quotes;

    public QuotesService(ILogger<QuotesService> logger)
    {
        _logger = logger;
        _quotes = InitializeQuotes();
    }

    public QuoteData GetRandomQuote()
    {
        var random = new Random();
        var quote = _quotes[random.Next(_quotes.Count)];
        _logger.LogInformation("Selected random quote: \"{QuoteText}\" by {Author}", quote.Text, quote.Author);
        return quote;
    }

    public List<QuoteData> GetAllQuotes()
    {
        return new List<QuoteData>(_quotes);
    }

    public QuoteData? GetQuoteByCategory(string category)
    {
        var quote = _quotes.FirstOrDefault(q => 
            string.Equals(q.Category, category, StringComparison.OrdinalIgnoreCase));
        
        if (quote != null)
        {
            _logger.LogInformation("Found quote for category '{Category}': \"{QuoteText}\" by {Author}", 
                category, quote.Text, quote.Author);
        }
        else
        {
            _logger.LogWarning("No quote found for category: {Category}", category);
        }
        
        return quote;
    }

    public List<QuoteData> GetQuotesByCategory(string category)
    {
        var quotes = _quotes.Where(q => 
            string.Equals(q.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();
        
        _logger.LogInformation("Found {Count} quotes for category '{Category}'", quotes.Count, category);
        return quotes;
    }

    private List<QuoteData> InitializeQuotes()
    {
        // Sample quotes - in production, this would come from your quotes service/database
        return new List<QuoteData>
        {
            new() { Text = "Peace comes from within. Do not seek it without.", Author = "Buddha", Category = "inner-peace" },
            new() { Text = "The present moment is the only time over which we have any power.", Author = "Thich Nhat Hanh", Category = "mindfulness" },
            new() { Text = "Meditation is not about stopping thoughts, but recognizing that we are more than our thoughts.", Author = "Arianna Huffington", Category = "meditation" },
            new() { Text = "Your task is not to seek for love, but merely to seek and find all the barriers within yourself that you have built against it.", Author = "Rumi", Category = "self-love" },
            new() { Text = "The quieter you become, the more you are able to hear.", Author = "Ram Dass", Category = "awareness" },
            new() { Text = "Happiness is not something ready-made. It comes from your own actions.", Author = "Dalai Lama", Category = "happiness" },
            new() { Text = "The mind is everything. What you think you become.", Author = "Buddha", Category = "mindfulness" },
            new() { Text = "Be the change that you wish to see in the world.", Author = "Mahatma Gandhi", Category = "inspiration" },
            new() { Text = "In the midst of movement and chaos, keep stillness inside of you.", Author = "Deepak Chopra", Category = "inner-peace" },
            new() { Text = "The only way to do great work is to love what you do.", Author = "Steve Jobs", Category = "inspiration" },
            new() { Text = "Every morning we are born again. What we do today matters most.", Author = "Buddha", Category = "mindfulness" },
            new() { Text = "The greatest glory in living lies not in never falling, but in rising every time we fall.", Author = "Nelson Mandela", Category = "resilience" },
            new() { Text = "Life is what happens when you're busy making other plans.", Author = "John Lennon", Category = "mindfulness" },
            new() { Text = "The only impossible journey is the one you never begin.", Author = "Tony Robbins", Category = "inspiration" },
            new() { Text = "You yourself, as much as anybody in the entire universe, deserve your love and affection.", Author = "Buddha", Category = "self-love" }
        };
    }
} 