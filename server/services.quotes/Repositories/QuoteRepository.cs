using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using services.quotes.Data;
using services.quotes.Domain;
using services.quotes.Models;
using services.quotes.Services;

namespace services.quotes.Repositories;

public class QuoteRepository : IQuoteRepository
{
    private readonly QuotesDbContext _context;
    private readonly ILogger<QuoteRepository> _logger;

    public QuoteRepository(QuotesDbContext context, ILogger<QuoteRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<List<Quote>> GetAllAsync()
    {
        try
        {
            _logger.LogInformation("Retrieving all quotes using Entity Framework");
            var entities = await _context.Quotes
                .ToListAsync();

            return entities.Select(e => e.ToDomain()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving all quotes");
            throw;
        }
    }

    public async Task<Quote?> GetByIdAsync(Guid id)
    {
        try
        {
            _logger.LogInformation("Retrieving quote by ID: {QuoteId} using Entity Framework", id);
            var entity = await _context.Quotes
                .FirstOrDefaultAsync(q => q.Id == id);

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quote by ID: {QuoteId}", id);
            throw;
        }
    }

    public async Task<Quote?> GetByCategoryAsync(string category)
    {
        try
        {
            _logger.LogInformation("Retrieving quote by category: {Category} using Entity Framework", category);
            var entity = await _context.Quotes
                .FirstOrDefaultAsync(q => q.Category.ToLower() == category.ToLower());

            return entity?.ToDomain();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quote by category: {Category}", category);
            throw;
        }
    }

    public async Task<List<Quote>> GetByCategoryListAsync(string category)
    {
        try
        {
            _logger.LogInformation("Retrieving quotes by category: {Category} using Entity Framework", category);
            var entities = await _context.Quotes
                .Where(q => q.Category.ToLower() == category.ToLower())
                .ToListAsync();

            return entities.Select(e => e.ToDomain()).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving quotes by category: {Category}", category);
            throw;
        }
    }
}

