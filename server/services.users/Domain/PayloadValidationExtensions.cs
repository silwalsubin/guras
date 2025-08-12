using Ardalis.GuardClauses;

namespace services.users.Domain;

public static class PayloadValidationExtensions
{
    public static void Validate(this CreateNewUserPayload payload)
    {
        Guard.Against.Null(payload, nameof(payload));
        Guard.Against.NullOrEmpty(payload.Email, nameof(payload.Email));
        Guard.Against.NullOrEmpty(payload.FireBaseUserId, nameof(payload.FireBaseUserId));
        Guard.Against.NullOrEmpty(payload.Name, nameof(payload.Name));
    }

    public static void Validate(this UpdateUserPayload payload)
    {
        Guard.Against.Null(payload, nameof(payload));
        Guard.Against.Null(payload.UserId, nameof(payload.UserId));
        Guard.Against.NullOrEmpty(payload.Email, nameof(payload.Email));
        Guard.Against.NullOrEmpty(payload.Name, nameof(payload.Name));
        Guard.Against.NullOrEmpty(payload.FireBaseUserId, nameof(payload.FireBaseUserId));
    }
}