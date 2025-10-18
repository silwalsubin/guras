using Microsoft.AspNetCore.Mvc;
using utilities.Responses;

namespace utilities.Controllers;

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
        if (!string.IsNullOrEmpty(field))
        {
            response.Error!.Field = field;
        }
        return BadRequest(response);
    }

    protected IActionResult NotFoundResponse(string message)
    {
        var response = ApiResponse.ErrorResponse(message, HttpContext.TraceIdentifier, null, "NOT_FOUND");
        return NotFound(response);
    }

    protected IActionResult UnauthorizedResponse(string message)
    {
        var response = ApiResponse.ErrorResponse(message, HttpContext.TraceIdentifier, null, "UNAUTHORIZED");
        return Unauthorized(response);
    }

    protected string? GetUserId()
    {
        return User.FindFirst("application_user_id")?.Value;
    }
}
