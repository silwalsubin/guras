using System.ComponentModel.DataAnnotations;
using services.notifications.Domain;

namespace services.notifications.Requests;

public class RegisterTokenRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string Platform { get; set; } = string.Empty;

    [Required]
    public string UserId { get; set; } = string.Empty;
}

public class SendNotificationRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;

    [Required]
    public string Title { get; set; } = string.Empty;

    [Required]
    public string Body { get; set; } = string.Empty;

    public Dictionary<string, string>? Data { get; set; }

    public string Platform { get; set; } = string.Empty;
}

public class SendQuoteNotificationRequest
{
    [Required]
    public List<string> UserTokens { get; set; } = new();

    [Required]
    public QuoteData Quote { get; set; } = new();
}

public class QuoteData
{
    public string Text { get; set; } = string.Empty;
    public string Author { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
}

public class TestTokenRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class TestFCMConnectionRequest
{
    [Required]
    public string Token { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
}

public class SetTestScheduleRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    [Required]
    public NotificationFrequency Frequency { get; set; }
}

public class TestScheduleImmediateRequest
{
    [Required]
    public string UserId { get; set; } = string.Empty;
    [Required]
    public NotificationFrequency Frequency { get; set; }
}
