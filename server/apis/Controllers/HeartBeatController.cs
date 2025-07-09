using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using apis.Configuration;
using Dapper;
using Npgsql;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HeartBeatController(ILogger<HeartBeatController> logger, DbConnectionProvider dbConnectionProvider)
    : ControllerBase
{
    [HttpGet]
    [AllowAnonymous]
    public ActionResult<string> Get()
    {
        logger.LogInformation("Heart Beat endpoint called");
        return Ok("Heart Beat Successful");
    }
    
    [HttpGet("DbConnection")]
    [AllowAnonymous]
    public async Task<IActionResult> GetConnectionString()
    {
        var connectionString = await dbConnectionProvider.GetConnectionStringAsync();
        await using var connection = new NpgsqlConnection(connectionString);
        var sqlServerTime = await connection.QuerySingleAsync<DateTime>("SELECT NOW()");
        return Ok(sqlServerTime);
    }

    [Authorize]
    [HttpGet("authenticated")]
    public ActionResult<object> GetAuthenticated()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;

        logger.LogInformation("Authenticated HelloWorld endpoint called by user {UserId}", userId);

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