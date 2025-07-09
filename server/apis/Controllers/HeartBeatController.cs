using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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
    public ActionResult<string> GetApplicationHeartBeat()
    {
        logger.LogInformation("Heart Beat endpoint called");
        return Ok("Heart Beat Successful");
    }
    
    [HttpGet("DbConnection")]
    [AllowAnonymous]
    public async Task<IActionResult> GetDbConnectionHeartBeat()
    {
        var connectionString = await dbConnectionProvider.GetConnectionStringAsync();
        await using var connection = new NpgsqlConnection(connectionString);
        var sqlServerTime = await connection.QuerySingleAsync<DateTime>("SELECT NOW()");
        return Ok(sqlServerTime);
    }
} 