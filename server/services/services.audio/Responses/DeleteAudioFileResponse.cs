using System.Text.Json.Serialization;

namespace services.audio.Responses;

public class DeleteAudioFileResponse
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}
