using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;

namespace apis.Authentication;

public class FirebaseService : IFirebaseService
{
    private readonly FirebaseAuth _firebaseAuth;

    public FirebaseService(IConfiguration configuration)
    {
        // Initialize Firebase Admin SDK if not already initialized
        if (FirebaseApp.DefaultInstance == null)
        {
            // For development, you can use a service account key file
            // In production, you should use environment variables or secure configuration
            var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];
            
            if (!string.IsNullOrEmpty(serviceAccountPath) && File.Exists(serviceAccountPath))
            {
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.FromFile(serviceAccountPath)
                });
            }
            else
            {
                // For development/testing, you can use default credentials
                // Make sure to set GOOGLE_APPLICATION_CREDENTIALS environment variable
                FirebaseApp.Create(new AppOptions
                {
                    Credential = GoogleCredential.GetApplicationDefault()
                });
            }
        }

        _firebaseAuth = FirebaseAuth.DefaultInstance;
    }

    public async Task<FirebaseToken> VerifyIdTokenAsync(string idToken)
    {
        try
        {
            return await _firebaseAuth.VerifyIdTokenAsync(idToken);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException("Invalid Firebase ID token", ex);
        }
    }

    public async Task<UserRecord> GetUserAsync(string uid)
    {
        try
        {
            return await _firebaseAuth.GetUserAsync(uid);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException($"User not found: {uid}", ex);
        }
    }
} 