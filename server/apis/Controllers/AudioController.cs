using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using services.audio.Models;
using services.audio.Services;
using apis.Extensions;
using apis.Requests;
using apis.Responses;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AudioController(IAudioFileService audioFileService, ILogger<AudioController> logger) : ControllerBase
{
    [HttpPost("upload")]
    public async Task<IActionResult> UploadAudio([FromForm] UploadAudioRequest request)
    {
        try
        {
            // Validate the request first - fail fast if invalid
            try
            {
                request.Validate();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }

            logger.LogInformation("Upload request received - Name: {Name}, Author: {Author}, AudioFile: {AudioFile}, ThumbnailFile: {ThumbnailFile}",
                request.Name, request.Author, request.AudioFile?.FileName, request.ThumbnailFile?.FileName);

            var userIdClaim = User.FindFirst("application_user_id")?.Value;
            if (string.IsNullOrWhiteSpace(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized("Application user ID not found in token");
            }

            var metadata = new CreateAudioFileRequest
            {
                Name = request.Name,
                Author = request.Author,
                Description = request.Description
            };

            // Convert IFormFile to FileUpload
            using var audioStream = request.AudioFile!.OpenReadStream();
            using var thumbnailStream = request.ThumbnailFile!.OpenReadStream();

            var audioFileUpload = new services.audio.Models.FileUpload
            {
                FileName = request.AudioFile!.FileName,
                ContentType = request.AudioFile!.ContentType,
                Length = request.AudioFile!.Length,
                Stream = audioStream
            };

            var thumbnailFileUpload = new services.audio.Models.FileUpload
            {
                FileName = request.ThumbnailFile!.FileName,
                ContentType = request.ThumbnailFile!.ContentType,
                Length = request.ThumbnailFile!.Length,
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

            return Ok(new AudioFilesResponse
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

            return Ok(new AudioFilesResponse
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
                return Ok(new DeleteAudioFileResponse { Message = "Audio file deleted successfully" });
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
