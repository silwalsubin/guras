using System.Diagnostics;
using System.Security.Claims;
using apis.Extensions;

namespace apis.Middleware;

public class RequestLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequestLoggingMiddleware> _logger;

    public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var correlationId = context.TraceIdentifier;

        // Extract user ID from claims if available
        var userId = context.User?.FindFirst("application_user_id")?.Value
                    ?? context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        // Log request
        _logger.LogApiRequest(
            context.Request.Path,
            context.Request.Method,
            ExtractRequestData(context),
            userId);

        // Add correlation ID to response headers
        context.Response.Headers["X-Correlation-ID"] = correlationId;

        try
        {
            await _next(context);
        }
        finally
        {
            stopwatch.Stop();

            // Log response
            _logger.LogApiResponse(
                context.Request.Path,
                context.Response.StatusCode,
                stopwatch.Elapsed,
                userId);

            // Log performance warning for slow requests
            if (stopwatch.Elapsed.TotalSeconds > 5)
            {
                _logger.LogPerformanceWarning(
                    $"{context.Request.Method} {context.Request.Path}",
                    stopwatch.Elapsed,
                    userId);
            }
        }
    }

    private static object? ExtractRequestData(HttpContext context)
    {
        // Only log request data for non-GET requests and non-file uploads
        if (context.Request.Method == "GET" ||
            context.Request.ContentType?.Contains("multipart/form-data") == true)
        {
            return null;
        }

        // For other requests, we could log query parameters or basic info
        return new
        {
            QueryString = context.Request.QueryString.Value,
            ContentType = context.Request.ContentType,
            ContentLength = context.Request.ContentLength
        };
    }
}
