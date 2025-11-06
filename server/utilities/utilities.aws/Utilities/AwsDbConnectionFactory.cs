using System.Data;
using utilities.Persistence;
using utilities.Persistence.ConnectionFactories;

namespace utilities.aws.Utilities;

public class AwsDbConnectionFactory : IDbConnectionFactory
{
    public async Task<IDbConnection> GetConnectionAsync()
    {
        var secretName = "guras/db-credentials";
        var dbConfiguration = await secretName.GetSecretValueAsync<DbConfiguration>();
        return dbConfiguration.GetConnection();
    }

    public string GetConnectionString()
    {
        // Synchronous call required for EF Core configuration
        // This will load from AWS Secrets Manager synchronously
        var secretName = "guras/db-credentials";
        var dbConfiguration = secretName.GetSecretValueAsync<DbConfiguration>().GetAwaiter().GetResult();
        return dbConfiguration.GetConnectionString();
    }
}
