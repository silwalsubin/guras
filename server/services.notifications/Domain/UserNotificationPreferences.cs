namespace services.notifications.Domain;

public class UserNotificationPreferences
{
    public string UserId { get; set; } = string.Empty;
    public bool Enabled { get; set; } = true;
    public NotificationFrequency Frequency { get; set; } = NotificationFrequency.Daily;
    public TimeSpan QuietHoursStart { get; set; } = new TimeSpan(22, 0, 0); // 10:00 PM
    public TimeSpan QuietHoursEnd { get; set; } = new TimeSpan(8, 0, 0);   // 8:00 AM
    public DateTime LastNotificationSent { get; set; } = DateTime.MinValue;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

public enum NotificationFrequency
{
    FiveMinutes = 0,
    Hourly = 1,
    TwiceDaily = 2,
    Daily = 3
}
