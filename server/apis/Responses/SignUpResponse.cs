using System.Text.Json.Serialization;

namespace apis.Responses;

public class SignUpResponse
{
    [JsonPropertyName("uid")]
    public string Uid { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }
    
    [JsonPropertyName("isNewUser")]
    public bool IsNewUser { get; set; }
    
    [JsonPropertyName("firebaseUid")]
    public string FirebaseUid { get; set; } = string.Empty;
}
