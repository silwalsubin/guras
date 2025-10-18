using System.Text.Json.Serialization;

namespace apis.Models;

public class UserInfo
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    
    [JsonPropertyName("name")]
    public string? Name { get; set; }
    
    [JsonPropertyName("firebaseUid")]
    public string FirebaseUid { get; set; } = string.Empty;
}
