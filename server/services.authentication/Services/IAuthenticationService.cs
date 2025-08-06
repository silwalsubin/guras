using FirebaseAdmin.Auth;

namespace services.authentication.Services;

public interface IAuthenticationService
{
    Task<FirebaseToken> VerifyIdTokenAsync(string idToken);
    Task<UserRecord> GetUserAsync(string uid);
}