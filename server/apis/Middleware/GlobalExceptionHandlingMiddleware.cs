using System.Net;
using System.Text.Json;
using utilities.Responses;

namespace apis.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;
    private readonly IWebHostEnvironment _environment;

    public GlobalExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<GlobalExceptionHandlingMiddleware> logger,
        IWebHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        _logger.LogError(exception, "An unhandled exception occurred. TraceId: {TraceId}", context.TraceIdentifier);

        var response = CreateErrorResponse(context, exception);

        context.Response.StatusCode = GetStatusCode(exception);
        context.Response.ContentType = "application/json";

        var jsonResponse = JsonSerializer.Serialize(response, new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        });

        await context.Response.WriteAsync(jsonResponse);
    }

    private ApiResponse CreateErrorResponse(HttpContext context, Exception exception)
    {
        var isDevelopment = _environment.IsDevelopment();

        return exception switch
        {
            ArgumentException argEx => ApiResponse.ErrorResponse(
                "Invalid request parameters",
                context.TraceIdentifier,
                isDevelopment ? argEx.Message : null,
                "VALIDATION_ERROR"),

            UnauthorizedAccessException => ApiResponse.ErrorResponse(
                "Access denied",
                context.TraceIdentifier,
                isDevelopment ? exception.Message : null,
                "UNAUTHORIZED"),

            KeyNotFoundException => ApiResponse.ErrorResponse(
                "Resource not found",
                context.TraceIdentifier,
                isDevelopment ? exception.Message : null,
                "NOT_FOUND"),

            InvalidOperationException invOpEx => ApiResponse.ErrorResponse(
                "Operation failed",
                context.TraceIdentifier,
                isDevelopment ? invOpEx.Message : null,
                "INVALID_OPERATION"),

            TimeoutException => ApiResponse.ErrorResponse(
                "Request timeout",
                context.TraceIdentifier,
                isDevelopment ? exception.Message : null,
                "TIMEOUT"),

            _ => ApiResponse.ErrorResponse(
                "An unexpected error occurred",
                context.TraceIdentifier,
                isDevelopment ? exception.Message : null,
                "INTERNAL_ERROR")
        };
    }

    private static int GetStatusCode(Exception exception)
    {
        return exception switch
        {
            ArgumentException => (int)HttpStatusCode.BadRequest,
            UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
            KeyNotFoundException => (int)HttpStatusCode.NotFound,
            InvalidOperationException => (int)HttpStatusCode.BadRequest,
            TimeoutException => (int)HttpStatusCode.RequestTimeout,
            _ => (int)HttpStatusCode.InternalServerError
        };
    }
}
