using System.Data;

namespace utilities.Persistence.ConnectionFactories;

public interface IDbConnectionFactory
{
    public Task<IDbConnection> GetConnectionAsync();
}
