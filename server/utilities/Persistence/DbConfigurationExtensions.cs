using Npgsql;

namespace utilities.Persistence;

public static class DbConfigurationExtensions
{
    public static NpgsqlConnection GetConnection(this DbConfiguration dbConfiguration, SslMode sslMode = SslMode.Require)
    {
        var connectionStringBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = dbConfiguration.ServerName,
            Port = dbConfiguration.Port!.Value,
            Username = dbConfiguration.UserName,
            Password = dbConfiguration.Password,
            Database = dbConfiguration.DatabaseName,
            SslMode = sslMode
        };
        return new NpgsqlConnection(connectionStringBuilder.ConnectionString);
    }
}
