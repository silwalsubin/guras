namespace apis.Requests;

public class UploadAudioRequest
{
    public string Name { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string? Description { get; set; }
    public IFormFile AudioFile { get; set; } = null!;
    public IFormFile ThumbnailFile { get; set; } = null!;
}
