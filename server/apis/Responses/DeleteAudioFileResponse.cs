using System.Text.Json.Serialization;

namespace apis.Responses;

public class DeleteAudioFileResponse
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
}
