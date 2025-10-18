using System.Text.Json.Serialization;

namespace apis.Responses;

public class UserProfileResponse
{
    [JsonPropertyName("uid")]
    public string Uid { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }
    
    [JsonPropertyName("photoUrl")]
    public string? PhotoUrl { get; set; }
    
    [JsonPropertyName("emailVerified")]
    public bool EmailVerified { get; set; }
}
