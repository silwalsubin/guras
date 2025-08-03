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
            var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];
            
            try
            {
                if (!string.IsNullOrEmpty(serviceAccountPath) && File.Exists(serviceAccountPath))
                {
                    FirebaseApp.Create(new AppOptions
                    {
                        Credential = GoogleCredential.FromFile(serviceAccountPath)
                    });
                    Console.WriteLine($"✅ Firebase Admin SDK initialized successfully from {serviceAccountPath}");
                }
                else
                {
                    Console.WriteLine($"⚠️ Firebase service account file not found at: {serviceAccountPath}");
                    Console.WriteLine("📋 Current directory: " + Directory.GetCurrentDirectory());
                    Console.WriteLine("📋 Available files in current directory:");
                    foreach (var file in Directory.GetFiles("."))
                    {
                        Console.WriteLine($"   - {file}");
                    }
                    
                    // For development/testing, try default credentials
                    try
                    {
                        FirebaseApp.Create(new AppOptions
                        {
                            Credential = GoogleCredential.GetApplicationDefault()
                        });
                        Console.WriteLine("✅ Firebase Admin SDK initialized with default credentials");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Failed to initialize Firebase with default credentials: {ex.Message}");
                        Console.WriteLine("⚠️ Firebase authentication and notifications will not work");
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to initialize Firebase Admin SDK: {ex.Message}");
                Console.WriteLine("⚠️ Firebase authentication and notifications will not work");
            }
        }
        else
        {
            Console.WriteLine("✅ Firebase Admin SDK already initialized");
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