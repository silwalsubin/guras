using System.Text.Json.Serialization;

namespace apis.Responses;

public class TokenVerificationResponse
{
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    [JsonPropertyName("applicationUserId")]
    public string? ApplicationUserId { get; set; }

    [JsonPropertyName("firebaseUid")]
    public string? FirebaseUid { get; set; }
}
