using apis.Configuration;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using utilities.HostEnvironment;
using utilities.Persistence;

namespace tests;

public static class TestServiceProvider
{
    public static T GetService<T>() where T : notnull
    {
        var configuration = new ConfigurationBuilder()
            .SetBasePath(Directory.GetCurrentDirectory())
            .AddJsonFile("appsettings.json", optional: false)
            .AddEnvironmentVariables()
            .Build();
        var dbConfiguration = configuration
            .GetSection("DbConfiguration")
            .Get<DbConfiguration>();
        RunEnvironment.SetToDevelopment();
        var services = new ServiceCollection();
        services.ConfigureApiServices(configuration);
        services.AddLogging(builder =>
        {
            builder.AddConsole();
            builder.SetMinimumLevel(LogLevel.Debug);
        });
        services.AddSingleton(dbConfiguration!);
        return services.BuildServiceProvider().GetRequiredService<T>()!;
    }
}
