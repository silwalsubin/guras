using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Dapper;
using utilities.aws.Utilities;
using utilities.Persistence.ConnectionFactories;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HeartBeatController(
    ILogger<HeartBeatController> logger, 
    IDbConnectionFactory dbConnectionFactory,
    AudioFilesUtility audioFilesUtility
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
        using var connection = await dbConnectionFactory.GetConnectionAsync();
        var sqlServerTime = await connection.QuerySingleAsync<DateTime>("SELECT NOW()");
        return Ok(sqlServerTime);
    }
    
    [HttpGet("S3Connection")]
    [AllowAnonymous]
    public async Task<IActionResult> GetS3ConnectionHeartBeat()
    {
        logger.LogInformation("S3 Connection Heart Beat endpoint called");
        // Try to list files in the bucket (this will test connectivity and permissions)
        var files = await audioFilesUtility.ListFilesAsync("");
        var fileCount = files.Count();
        return Ok(fileCount);
    }
} 