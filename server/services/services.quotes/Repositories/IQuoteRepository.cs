using services.quotes.Domain;

namespace services.quotes.Repositories;

public interface IQuoteRepository
{
    Task<List<Quote>> GetAllAsync();
    Task<Quote?> GetByIdAsync(Guid id);
    Task<Quote?> GetByCategoryAsync(string category);
    Task<List<Quote>> GetByCategoryListAsync(string category);
}

