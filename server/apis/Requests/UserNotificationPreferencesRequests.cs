namespace apis.Requests;

public class UpdateNotificationPreferencesRequest
{
    public bool Enabled { get; set; }
    public string Frequency { get; set; } = string.Empty; // "5min", "hourly", "twice-daily", "daily"
    public QuietHoursRequest QuietHours { get; set; } = new();
}

public class QuietHoursRequest
{
    public string Start { get; set; } = string.Empty; // "HH:MM" format
    public string End { get; set; } = string.Empty;   // "HH:MM" format
}
