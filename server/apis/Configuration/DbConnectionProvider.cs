using Npgsql;

namespace apis.Configuration;

public class DbConnectionProvider(AppSettingsDbConfiguration appSettingsDbConfiguration)
{
    public async Task<string> GetConnectionStringAsync()
    {
        DbConfiguration dbConfiguration = appSettingsDbConfiguration;
        var isProduction = RunEnvironment.IsProduction();

        if (isProduction)
        {
            var secretName = "guras/db-credentials";
            dbConfiguration = await secretName.GetSecretValueAsync<DbConfiguration>();
        }

        var connectionStringBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = dbConfiguration.ServerName,
            Port = dbConfiguration.Port!.Value,
            Username = dbConfiguration.UserName,
            Password = dbConfiguration.Password,
            Database = dbConfiguration.DatabaseName,
            SslMode = SslMode.Require
        };
        return connectionStringBuilder.ConnectionString;
    }
}