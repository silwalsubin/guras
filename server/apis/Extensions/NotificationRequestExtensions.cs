using apis.Requests;
using CommunityToolkit.Diagnostics;

namespace apis.Extensions;

public static class NotificationRequestExtensions
{
    public static void Validate(this RegisterTokenRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.Token, nameof(request.Token));
        Guard.IsNotNullOrEmpty(request.Platform, nameof(request.Platform));
        Guard.IsNotNullOrEmpty(request.UserId, nameof(request.UserId));
    }

    public static void Validate(this SendNotificationRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.Token, nameof(request.Token));
        Guard.IsNotNullOrEmpty(request.Title, nameof(request.Title));
        Guard.IsNotNullOrEmpty(request.Body, nameof(request.Body));
    }

    public static void Validate(this SendQuoteNotificationRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNull(request.UserTokens, nameof(request.UserTokens));
        Guard.IsTrue(request.UserTokens.Any(), nameof(request.UserTokens), "At least one user token is required");
        Guard.IsNotNull(request.Quote, nameof(request.Quote));
        Guard.IsNotNullOrEmpty(request.Quote.Text, nameof(request.Quote.Text));
        Guard.IsNotNullOrEmpty(request.Quote.Author, nameof(request.Quote.Author));
    }

    public static void Validate(this TestTokenRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.Token, nameof(request.Token));
    }

    public static void Validate(this TestFCMConnectionRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.Token, nameof(request.Token));
    }

    public static void Validate(this SetTestScheduleRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.UserId, nameof(request.UserId));
    }

    public static void Validate(this TestScheduleImmediateRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.UserId, nameof(request.UserId));
    }
}
