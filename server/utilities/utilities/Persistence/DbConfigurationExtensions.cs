using Microsoft.Extensions.Configuration;
using Npgsql;

namespace utilities.Persistence;

public static class DbConfigurationExtensions
{
    private static SslMode DetermineSslMode(DbConfiguration dbConfiguration)
    {
        // Disable SSL for localhost connections, require for remote connections
        var serverName = dbConfiguration.ServerName?.ToLowerInvariant() ?? string.Empty;
        if (serverName == "localhost" || serverName == "127.0.0.1" || serverName.StartsWith("localhost:"))
        {
            return SslMode.Disable;
        }
        return SslMode.Require;
    }

    /// <summary>
    /// Gets the database connection string from the configuration's DbConfiguration section.
    /// </summary>
    /// <param name="configuration">The configuration instance.</param>
    /// <param name="sslMode">Optional SSL mode override. If not provided, will be automatically determined based on server name.</param>
    /// <returns>The database connection string.</returns>
    /// <exception cref="InvalidOperationException">Thrown when DbConfiguration is missing or invalid.</exception>
    public static string GetDatabaseConnectionString(this IConfiguration configuration, SslMode? sslMode = null)
    {
        var dbConfiguration = configuration.GetSection("DbConfiguration").Get<DbConfiguration>();
        return dbConfiguration.GetConnectionString(sslMode);
    }

    public static NpgsqlConnection GetConnection(this DbConfiguration dbConfiguration, SslMode? sslMode = null)
    {
        var connectionStringBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = dbConfiguration.ServerName,
            Port = dbConfiguration.Port!.Value,
            Username = dbConfiguration.UserName,
            Password = dbConfiguration.Password,
            Database = dbConfiguration.DatabaseName,
            SslMode = sslMode ?? DetermineSslMode(dbConfiguration)
        };
        return new NpgsqlConnection(connectionStringBuilder.ConnectionString);
    }

    public static string GetConnectionString(this DbConfiguration? dbConfiguration, SslMode? sslMode = null)
    {
        if (dbConfiguration == null)
        {
            throw new InvalidOperationException("DbConfiguration is required");
        }

        if (string.IsNullOrWhiteSpace(dbConfiguration.ServerName))
        {
            throw new InvalidOperationException("DbConfiguration.ServerName is required");
        }

        if (!dbConfiguration.Port.HasValue)
        {
            throw new InvalidOperationException("DbConfiguration.Port is required");
        }

        var connectionStringBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = dbConfiguration.ServerName,
            Port = dbConfiguration.Port.Value,
            Username = dbConfiguration.UserName,
            Password = dbConfiguration.Password,
            Database = dbConfiguration.DatabaseName,
            SslMode = sslMode ?? DetermineSslMode(dbConfiguration)
        };
        return connectionStringBuilder.ConnectionString;
    }
}
