using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using apis.Responses;

namespace apis.Filters;

public class ValidationActionFilter : IActionFilter
{
    private readonly ILogger<ValidationActionFilter> _logger;

    public ValidationActionFilter(ILogger<ValidationActionFilter> logger)
    {
        _logger = logger;
    }

    public void OnActionExecuting(ActionExecutingContext context)
    {
        foreach (var parameter in context.ActionDescriptor.Parameters)
        {
            if (context.ActionArguments.TryGetValue(parameter.Name, out var value) && value != null)
            {
                // Check if the parameter has a Validate method (our extension methods)
                var validateMethod = value.GetType().GetMethod("Validate");
                if (validateMethod != null)
                {
                    try
                    {
                        validateMethod.Invoke(value, null);
                        _logger.LogDebug("Validation passed for {ParameterName} of type {ParameterType}",
                            parameter.Name, parameter.ParameterType.Name);
                    }
                    catch (Exception ex) when (ex.InnerException is ArgumentException argEx)
                    {
                        _logger.LogWarning("Validation failed for {ParameterName}: {ErrorMessage}",
                            parameter.Name, argEx.Message);

                        var errorResponse = ApiResponse.ErrorResponse(
                            argEx.Message,
                            context.HttpContext.TraceIdentifier,
                            null,
                            "VALIDATION_ERROR");

                        context.Result = new BadRequestObjectResult(errorResponse);
                        return;
                    }
                }
            }
        }
    }

    public void OnActionExecuted(ActionExecutedContext context)
    {
        // No action needed after execution
    }
}
