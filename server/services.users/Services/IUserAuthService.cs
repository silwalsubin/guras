using FirebaseAdmin.Auth;

namespace services.users.Services;

public interface IUserAuthService
{
    Task<FirebaseToken> VerifyIdTokenAsync(string idToken);
    Task<UserRecord> GetUserAsync(string uid);
}
