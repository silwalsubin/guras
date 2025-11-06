using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using services.users.Data;
using utilities.aws.Utilities;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HeartBeatController(
    ILogger<HeartBeatController> logger,
    UsersDbContext dbContext,
    AudioFilesUtility audioFilesUtility
) : ControllerBase
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
        try
        {
            var sqlServerTime = await dbContext.Database.SqlQueryRaw<DateTime>("SELECT NOW()").FirstOrDefaultAsync();
            return Ok(sqlServerTime);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Database connection heartbeat failed");
            return StatusCode(500, "Database connection failed");
        }
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
