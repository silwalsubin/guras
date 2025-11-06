namespace utilities.HostEnvironment;

public static class RunEnvironment
{
    public static bool IsProduction()
    {
        return Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") != "Development";
    }

    public static void SetToDevelopment()
    {
        Environment.SetEnvironmentVariable("ASPNETCORE_ENVIRONMENT", "Development");
    }
}
