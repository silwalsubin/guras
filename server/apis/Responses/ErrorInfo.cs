using System.Text.Json.Serialization;

namespace apis.Responses;

public class ErrorInfo
{
    [JsonPropertyName("code")]
    public string Code { get; set; } = string.Empty;
    
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;
    
    [JsonPropertyName("details")]
    public string? Details { get; set; }
    
    [JsonPropertyName("field")]
    public string? Field { get; set; }
}
