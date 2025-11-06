using System.Data;

namespace utilities.Persistence.ConnectionFactories;

public interface IDbConnectionFactory
{
    public Task<IDbConnection> GetConnectionAsync();
    
    /// <summary>
    /// Gets the connection string synchronously. This is required for Entity Framework Core configuration
    /// which happens synchronously during service registration.
    /// </summary>
    /// <returns>The database connection string.</returns>
    public string GetConnectionString();
}
