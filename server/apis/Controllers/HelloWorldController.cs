using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HelloWorldController : ControllerBase
{
    private readonly ILogger<HelloWorldController> _logger;

    public HelloWorldController(ILogger<HelloWorldController> logger)
    {
        _logger = logger;
    }

    [HttpGet]
    public ActionResult<string> Get()
    {
        _logger.LogInformation("HelloWorld endpoint called");
        return Ok("HelloWorld");
    }

    [Authorize]
    [HttpGet("authenticated")]
    public ActionResult<object> GetAuthenticated()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;

        _logger.LogInformation("Authenticated HelloWorld endpoint called by user {UserId}", userId);

        return Ok(new
        {
            message = "Hello from authenticated endpoint!",
            userId,
            email,
            name,
            timestamp = DateTime.UtcNow
        });
    }
} 