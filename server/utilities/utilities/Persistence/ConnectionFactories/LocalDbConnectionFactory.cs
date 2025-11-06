using System.Data;
using Npgsql;
using utilities.Persistence;

namespace utilities.Persistence.ConnectionFactories;

public class LocalDbConnectionFactory(DbConfiguration dbConfiguration) : IDbConnectionFactory
{
    public Task<IDbConnection> GetConnectionAsync()
    {
        return Task.FromResult<IDbConnection>(dbConfiguration.GetConnection(SslMode.Disable));
    }

    public string GetConnectionString()
    {
        return dbConfiguration.GetConnectionString(SslMode.Disable);
    }
}
