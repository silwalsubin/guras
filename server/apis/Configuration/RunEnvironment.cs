namespace apis.Configuration;

public static class RunEnvironment
{
    public static bool IsProduction()
    {
        return Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development";
    }
}