using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using utilities.aws.Utilities;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AudioController(AudioFilesUtility audioFilesUtility, ILogger<AudioController> logger) : ControllerBase
{
    [HttpPost("upload-url")]
    public async Task<IActionResult> GetUploadUrl([FromBody] GetUploadUrlRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.FileName))
            {
                return BadRequest("File name is required");
            }

            // Generate a unique file name to prevent conflicts
            var fileExtension = Path.GetExtension(request.FileName);
            var uniqueFileName = $"{Guid.NewGuid()}{fileExtension}";

            var expiration = TimeSpan.FromMinutes(request.ExpirationMinutes ?? 15);
            var presignedUrl = await audioFilesUtility.GeneratePreSignedUploadUrlAsync(uniqueFileName, expiration);

            return Ok(new
            {
                UploadUrl = presignedUrl,
                FileName = uniqueFileName,
                ExpiresAt = DateTime.UtcNow.Add(expiration)
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error generating upload URL for file: {FileName}", request.FileName);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("audio-files")]
    public async Task<IActionResult> GetAudioFilesWithDownloadUrls([FromQuery] int? expirationMinutes = null)
    {
        try
        {
            var expiration = TimeSpan.FromMinutes(expirationMinutes ?? 60);
            var files = await audioFilesUtility.ListFilesAsync();
            
            var audioFilesWithUrls = new List<object>();
            
            foreach (var fileName in files)
            {
                var downloadUrl = await audioFilesUtility.GeneratePreSignedDownloadUrlAsync(fileName, expiration);
                // Basic metadata derivation
                var title = Path.GetFileNameWithoutExtension(fileName) ?? string.Empty;
                var artist = "Guras";

                // Try find artwork/background image by convention
                string? artworkKey = null;
                var baseName = Path.GetFileNameWithoutExtension(fileName) ?? string.Empty;
                var candidateKeys = new[]
                {
                    $"{baseName}.jpg",
                    $"{baseName}.png",
                    $"artwork/{baseName}.jpg",
                    $"artwork/{baseName}.png",
                };
                foreach (var candidate in candidateKeys)
                {
                    if (await audioFilesUtility.FileExistsAsync(candidate))
                    {
                        artworkKey = candidate;
                        break;
                    }
                }

                string? artworkUrl = null;
                if (!string.IsNullOrWhiteSpace(artworkKey))
                {
                    artworkUrl = await audioFilesUtility.GeneratePreSignedDownloadUrlAsync(artworkKey!, expiration);
                }

                audioFilesWithUrls.Add(new
                {
                    FileName = fileName,
                    DownloadUrl = downloadUrl,
                    ExpiresAt = DateTime.UtcNow.Add(expiration),
                    Title = title,
                    Artist = artist,
                    ArtworkUrl = artworkUrl
                });
            }

            return Ok(new
            {
                Files = audioFilesWithUrls,
                TotalCount = audioFilesWithUrls.Count,
                ExpirationMinutes = expirationMinutes ?? 60
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting audio files with download URLs");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("files")]
    public async Task<IActionResult> ListFiles([FromQuery] string? prefix = null)
    {
        try
        {
            var files = await audioFilesUtility.ListFilesAsync(prefix ?? "");
            return Ok(new { Files = files });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error listing files with prefix: {Prefix}", prefix);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{fileName}")]
    public async Task<IActionResult> DeleteFile(string fileName)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(fileName))
            {
                return BadRequest("File name is required");
            }

            var success = await audioFilesUtility.DeleteFileAsync(fileName);
            if (success)
            {
                return Ok(new { Message = "File deleted successfully" });
            }
            else
            {
                return StatusCode(500, "Failed to delete file");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting file: {FileName}", fileName);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{fileName}/exists")]
    public async Task<IActionResult> CheckFileExists(string fileName)
    {
        try
        {
            var exists = await audioFilesUtility.FileExistsAsync(fileName);
            return Ok(new { Exists = exists });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error checking if file exists: {FileName}", fileName);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class GetUploadUrlRequest
{
    public string FileName { get; set; } = string.Empty;
    public int? ExpirationMinutes { get; set; }
}