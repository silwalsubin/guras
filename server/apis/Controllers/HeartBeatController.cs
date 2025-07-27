using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using apis.Configuration;
using apis.Services;
using Dapper;
using Npgsql;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HeartBeatController(
    ILogger<HeartBeatController> logger, 
    DbConnectionProvider dbConnectionProvider, 
    IS3Service s3Service
): ControllerBase
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
    
    [HttpGet("S3Connection")]
    [AllowAnonymous]
    public async Task<IActionResult> GetS3ConnectionHeartBeat()
    {
        logger.LogInformation("S3 Connection Heart Beat endpoint called");
        // Try to list files in the bucket (this will test connectivity and permissions)
        var files = await s3Service.ListFilesAsync("");
        var fileCount = files.Count();
        return Ok(fileCount);
    }
} 