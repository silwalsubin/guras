using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using services.notifications.Domain;

namespace services.notifications.Models;

[Table("user_notification_preferences")]
public class UserNotificationPreferencesEntity
{
    [Key]
    [MaxLength(255)]
    [Column("user_id")]
    public string UserId { get; set; } = string.Empty;

    [Column("enabled")]
    public bool Enabled { get; set; } = true;

    [Column("frequency")]
    public int Frequency { get; set; } = (int)NotificationFrequency.Daily;

    [Column("quiet_hours_start")]
    public TimeSpan QuietHoursStart { get; set; } = new TimeSpan(22, 0, 0);

    [Column("quiet_hours_end")]
    public TimeSpan QuietHoursEnd { get; set; } = new TimeSpan(8, 0, 0);

    [Column("last_notification_sent")]
    public DateTime LastNotificationSent { get; set; } = DateTime.MinValue;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; }

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; }
}

