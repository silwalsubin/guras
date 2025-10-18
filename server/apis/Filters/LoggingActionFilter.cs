using Microsoft.AspNetCore.Mvc.Filters;
using apis.Extensions;

namespace apis.Filters;

public class LoggingActionFilter : IActionFilter
{
    private readonly ILogger<LoggingActionFilter> _logger;

    public LoggingActionFilter(ILogger<LoggingActionFilter> logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        var userId = context.HttpContext.User?.FindFirst("application_user_id")?.Value;
        var operation = $"{context.ActionDescriptor.DisplayName}";
        
        _logger.LogBusinessOperation(
            $"Starting {operation}", 
            userId, 
            new { 
                Controller = context.Controller.GetType().Name,
                Action = context.ActionDescriptor.DisplayName,
                Arguments = context.ActionArguments
            });
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        var userId = context.HttpContext.User?.FindFirst("application_user_id")?.Value;
        var operation = $"{context.ActionDescriptor.DisplayName}";
        
        if (context.Exception != null)
        {
            _logger.LogError(context.Exception, 
                "Exception in {Operation} UserId: {UserId}", 
                operation, userId ?? "Anonymous");
        }
        else
        {
            _logger.LogBusinessOperation(
                $"Completed {operation}", 
                userId, 
                new { 
                    StatusCode = context.HttpContext.Response.StatusCode,
                    ResultType = context.Result?.GetType().Name
                });
        }
    }
}
