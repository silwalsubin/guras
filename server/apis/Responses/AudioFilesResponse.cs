using System.Text.Json.Serialization;
using services.audio.Models;

namespace apis.Responses;

public class AudioFilesResponse
{
    [JsonPropertyName("files")]
    public IEnumerable<AudioFileResponse> Files { get; set; } = new List<AudioFileResponse>();

    [JsonPropertyName("totalCount")]
    public int TotalCount { get; set; }

    [JsonPropertyName("expirationMinutes")]
    public int ExpirationMinutes { get; set; }
}
