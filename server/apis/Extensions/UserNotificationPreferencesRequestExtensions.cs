using apis.Requests;
using CommunityToolkit.Diagnostics;

namespace apis.Extensions;

public static class UserNotificationPreferencesRequestExtensions
{
    public static void Validate(this UpdateNotificationPreferencesRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.Frequency, nameof(request.Frequency));
        Guard.IsNotNull(request.QuietHours, nameof(request.QuietHours));
        Guard.IsNotNullOrEmpty(request.QuietHours.Start, nameof(request.QuietHours.Start));
        Guard.IsNotNullOrEmpty(request.QuietHours.End, nameof(request.QuietHours.End));
        
        // Validate time format
        Guard.IsTrue(TimeSpan.TryParse(request.QuietHours.Start, out _), 
            nameof(request.QuietHours.Start), "Invalid time format. Use HH:MM format.");
        Guard.IsTrue(TimeSpan.TryParse(request.QuietHours.End, out _), 
            nameof(request.QuietHours.End), "Invalid time format. Use HH:MM format.");
    }
}
