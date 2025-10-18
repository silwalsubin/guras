using Microsoft.AspNetCore.Mvc;
using apis.Responses;

namespace apis.Controllers;

[ApiController]
public abstract class BaseController : ControllerBase
{
    protected IActionResult SuccessResponse<T>(T data)
    {
        return Ok(ApiResponse<T>.SuccessResponse(data, HttpContext.TraceIdentifier));
    }

    protected IActionResult SuccessResponse()
    {
        return Ok(ApiResponse.SuccessResponse(HttpContext.TraceIdentifier));
    }

    protected IActionResult ErrorResponse(string message, int statusCode = 400, string? details = null, string? code = null)
    {
        var response = ApiResponse.ErrorResponse(message, HttpContext.TraceIdentifier, details, code);
        return StatusCode(statusCode, response);
    }

    protected IActionResult ValidationErrorResponse(string message, string? field = null)
    {
        var response = ApiResponse.ErrorResponse(message, HttpContext.TraceIdentifier, null, "VALIDATION_ERROR");
        if (response.Error != null && !string.IsNullOrEmpty(field))
        {
            response.Error.Field = field;
        }
        return BadRequest(response);
    }

    protected IActionResult NotFoundResponse(string message = "Resource not found")
    {
        return ErrorResponse(message, 404, code: "NOT_FOUND");
    }

    protected IActionResult UnauthorizedResponse(string message = "Access denied")
    {
        return ErrorResponse(message, 401, code: "UNAUTHORIZED");
    }

    protected string? GetUserId()
    {
        return User.FindFirst("application_user_id")?.Value 
               ?? User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
    }
}
