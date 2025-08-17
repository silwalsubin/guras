using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using services.audio.Models;
using services.audio.Services;
using System.Security.Claims;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AudioController(IAudioFileService audioFileService, ILogger<AudioController> logger, IWebHostEnvironment environment) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> UploadAudio()
    {
        try
        {
            // Get form data manually
            var form = await Request.ReadFormAsync();

            var name = form["Name"].ToString();
            var author = form["Author"].ToString();
            var description = form["Description"].ToString();

            var audioFile = form.Files["AudioFile"];
            var thumbnailFile = form.Files["ThumbnailFile"];

            logger.LogInformation("Upload request received - Name: {Name}, Author: {Author}, AudioFile: {AudioFile}, ThumbnailFile: {ThumbnailFile}",
                name, author, audioFile?.FileName, thumbnailFile?.FileName);

            if (string.IsNullOrWhiteSpace(name))
            {
                return BadRequest("Name is required");
            }

            if (string.IsNullOrWhiteSpace(author))
            {
                return BadRequest("Author is required");
            }

            if (audioFile == null)
            {
                return BadRequest("Audio file is required");
            }

            if (thumbnailFile == null)
            {
                return BadRequest("Thumbnail file is required");
            }

            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Application user ID not found in token");
            }

            var metadata = new CreateAudioFileRequest
            {
                Name = name,
                Author = author,
                Description = description
            };

            // Convert IFormFile to FileUpload
            using var audioStream = audioFile.OpenReadStream();
            using var thumbnailStream = thumbnailFile.OpenReadStream();

            var audioFileUpload = new services.audio.Models.FileUpload
            {
                FileName = audioFile.FileName,
                ContentType = audioFile.ContentType,
                Length = audioFile.Length,
                Stream = audioStream
            };

            var thumbnailFileUpload = new services.audio.Models.FileUpload
            {
                FileName = thumbnailFile.FileName,
                ContentType = thumbnailFile.ContentType,
                Length = thumbnailFile.Length,
                Stream = thumbnailStream
            };

            var response = await audioFileService.UploadAudioAsync(audioFileUpload, thumbnailFileUpload, metadata, userId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error uploading audio");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("audio-files")]
    public async Task<IActionResult> GetAudioFiles([FromQuery] int? expirationMinutes = null)
    {
        try
        {
            var audioFiles = await audioFileService.GetAllAsync(expirationMinutes ?? 60);

            return Ok(new
            {
                Files = audioFiles,
                TotalCount = audioFiles.Count(),
                ExpirationMinutes = expirationMinutes ?? 60
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting audio files");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("my-audio-files")]
    public async Task<IActionResult> GetMyAudioFiles([FromQuery] int? expirationMinutes = null)
    {
        try
        {
            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Application user ID not found in token");
            }

            var audioFiles = await audioFileService.GetByUserIdAsync(userId, expirationMinutes ?? 60);

            return Ok(new
            {
                Files = audioFiles,
                TotalCount = audioFiles.Count(),
                ExpirationMinutes = expirationMinutes ?? 60
            });
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting user's audio files");
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetAudioFile(Guid id, [FromQuery] int? expirationMinutes = null)
    {
        try
        {
            var audioFile = await audioFileService.GetByIdAsync(id, expirationMinutes ?? 60);
            if (audioFile == null)
            {
                return NotFound("Audio file not found");
            }

            return Ok(audioFile);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting audio file: {AudioFileId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateAudioFile(Guid id, [FromBody] CreateAudioFileRequest request, [FromQuery] int? expirationMinutes = null)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Name))
            {
                return BadRequest("Name is required");
            }

            if (string.IsNullOrWhiteSpace(request.Author))
            {
                return BadRequest("Author is required");
            }

            var audioFile = await audioFileService.UpdateAsync(id, request, expirationMinutes ?? 60);
            if (audioFile == null)
            {
                return NotFound("Audio file not found");
            }

            return Ok(audioFile);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error updating audio file: {AudioFileId}", id);
            return StatusCode(500, "Internal server error");
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteAudioFile(Guid id)
    {
        try
        {
            var success = await audioFileService.DeleteAsync(id);
            if (success)
            {
                return Ok(new { Message = "Audio file deleted successfully" });
            }
            else
            {
                return NotFound("Audio file not found");
            }
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error deleting audio file: {AudioFileId}", id);
            return StatusCode(500, "Internal server error");
        }
    }
}

public class UploadAudioRequest
{
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IFormFile AudioFile { get; set; } = null!;
    public IFormFile ThumbnailFile { get; set; } = null!;
}