namespace apis.Extensions;

public static class LoggingExtensions
{
    public static void LogApiRequest(this ILogger logger, string endpoint, string method, object? request = null, string? userId = null)
    {
        logger.LogInformation("🌐 API Request: {Method} {Endpoint} {@Request} UserId: {UserId}",
            method, endpoint, request, userId ?? "Anonymous");
    }

    public static void LogApiResponse(this ILogger logger, string endpoint, int statusCode, TimeSpan duration, string? userId = null)
    {
        var logLevel = statusCode >= 400 ? LogLevel.Warning : LogLevel.Information;
        var emoji = statusCode >= 400 ? "❌" : "✅";

        logger.Log(logLevel, "{Emoji} API Response: {Endpoint} {StatusCode} {Duration}ms UserId: {UserId}",
            emoji, endpoint, statusCode, duration.TotalMilliseconds, userId ?? "Anonymous");
    }

    public static void LogBusinessOperation(this ILogger logger, string operation, string? userId = null, object? details = null)
    {
        logger.LogInformation("🔧 Business Operation: {Operation} UserId: {UserId} {@Details}",
            operation, userId ?? "Anonymous", details);
    }

    public static void LogSecurityEvent(this ILogger logger, string eventType, string? userId = null, string? details = null)
    {
        logger.LogWarning("🔒 Security Event: {EventType} UserId: {UserId} Details: {Details}",
            eventType, userId ?? "Anonymous", details ?? "N/A");
    }

    public static void LogPerformanceWarning(this ILogger logger, string operation, TimeSpan duration, string? userId = null)
    {
        logger.LogWarning("⏱️ Performance Warning: {Operation} took {Duration}ms UserId: {UserId}",
            operation, duration.TotalMilliseconds, userId ?? "Anonymous");
    }
}
