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
            
            Console.WriteLine($"🔍 Firebase initialization - ServiceAccountPath: {serviceAccountPath}");
            Console.WriteLine($"🔍 Current directory: {Directory.GetCurrentDirectory()}");
            
            try
            {
                if (!string.IsNullOrEmpty(serviceAccountPath))
                {
                    Console.WriteLine($"🔍 Checking if file exists: {serviceAccountPath}");
                    Console.WriteLine($"🔍 File.Exists result: {File.Exists(serviceAccountPath)}");
                    
                    if (File.Exists(serviceAccountPath))
                    {
                        Console.WriteLine($"🔍 File size: {new FileInfo(serviceAccountPath).Length} bytes");
                        FirebaseApp.Create(new AppOptions
                        {
                            Credential = GoogleCredential.FromFile(serviceAccountPath)
                        });
                        Console.WriteLine($"✅ Firebase Admin SDK initialized successfully from {serviceAccountPath}");
                    }
                    else
                    {
                        Console.WriteLine($"⚠️ Firebase service account file not found at: {serviceAccountPath}");
                        Console.WriteLine("📋 Available files in current directory:");
                        foreach (var file in Directory.GetFiles("."))
                        {
                            Console.WriteLine($"   - {file}");
                        }
                        
                        Console.WriteLine("📋 Available files in apis directory:");
                        if (Directory.Exists("apis"))
                        {
                            foreach (var file in Directory.GetFiles("apis"))
                            {
                                Console.WriteLine($"   - apis/{file}");
                            }
                        }
                        else
                        {
                            Console.WriteLine("   - apis directory does not exist");
                        }
                        
                        // For development/testing, try default credentials
                        try
                        {
                            Console.WriteLine("🔍 Trying default credentials...");
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
                else
                {
                    Console.WriteLine("⚠️ Firebase service account path not configured");
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