using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using apis.Configuration;

namespace apis.Controllers;


[ApiController]
[Route("api/[controller]")]
public class HelloWorldController : ControllerBase
{
    private readonly ILogger<HelloWorldController> _logger;
    private readonly DbConnectionProvider _dbConnectionProvider;

    public HelloWorldController(ILogger<HelloWorldController> logger, DbConnectionProvider dbConnectionProvider)
    {
        _logger = logger;
        _dbConnectionProvider = dbConnectionProvider;
    }

    [HttpGet]
    [AllowAnonymous]
    public ActionResult<string> Get()
    {
        _logger.LogInformation("HelloWorld endpoint called");
        return Ok("HelloWorld");
    }
    
    [HttpGet("connectionstring")]
    [AllowAnonymous]
    public async Task<IActionResult> GetConnectionString()
    {
        var result = await _dbConnectionProvider.GetConnectionStringAsync();
        return Ok(result);
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