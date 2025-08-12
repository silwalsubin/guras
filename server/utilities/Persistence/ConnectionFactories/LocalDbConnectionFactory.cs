using System.Data;
using Npgsql;

namespace utilities.Persistence.ConnectionFactories;

public class LocalDbConnectionFactory(DbConfiguration dbConfiguration) : IDbConnectionFactory
{
    public Task<IDbConnection> GetConnectionAsync()
    {
        return Task.FromResult<IDbConnection>(dbConfiguration.GetConnection(SslMode.Disable));
    }
}