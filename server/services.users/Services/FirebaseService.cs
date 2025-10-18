using FirebaseAdmin;
using FirebaseAdmin.Auth;
using Google.Apis.Auth.OAuth2;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace services.users.Services;

public class FirebaseService : IUserAuthService
{
    private readonly FirebaseAuth _firebaseAuth;

    public FirebaseService(IConfiguration configuration, ILogger<FirebaseService> logger)
    {
        // Initialize Firebase Admin SDK if not already initialized
        if (FirebaseApp.DefaultInstance == null)
        {
            var serviceAccountPath = configuration["Firebase:ServiceAccountPath"];

            logger.LogInformation("Firebase initialization - ServiceAccountPath: {ServiceAccountPath}", serviceAccountPath);
            logger.LogInformation("Current directory: {CurrentDirectory}", Directory.GetCurrentDirectory());

            try
            {
                if (!string.IsNullOrEmpty(serviceAccountPath))
                {
                    logger.LogInformation("Checking if file exists: {ServiceAccountPath}", serviceAccountPath);
                    logger.LogInformation("File.Exists result: {FileExists}", File.Exists(serviceAccountPath));

                    if (File.Exists(serviceAccountPath))
                    {
                        logger.LogInformation("File size: {FileSize} bytes", new FileInfo(serviceAccountPath).Length);

                        // Read and parse the service account file to get project info
                        try
                        {
                            var serviceAccountJson = File.ReadAllText(serviceAccountPath);
                            var serviceAccountData = System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, object>>(serviceAccountJson);

                            if (serviceAccountData != null && serviceAccountData.ContainsKey("project_id"))
                            {
                                logger.LogInformation("Firebase Project ID: {ProjectId}", serviceAccountData["project_id"]);
                            }

                            if (serviceAccountData != null && serviceAccountData.ContainsKey("client_email"))
                            {
                                logger.LogInformation("Service Account Email: {ClientEmail}", serviceAccountData["client_email"]);
                            }
                        }
                        catch (Exception ex)
                        {
                            logger.LogWarning(ex, "⚠️ Could not parse service account file: {ErrorMessage}", ex.Message);
                        }

                        FirebaseApp.Create(new AppOptions
                        {
                            Credential = GoogleCredential.FromFile(serviceAccountPath)
                        });
                        logger.LogInformation("Firebase Admin SDK initialized successfully from {ServiceAccountPath}", serviceAccountPath);
                    }
                    else
                    {
                        logger.LogWarning("⚠️ Firebase service account file not found at: {ServiceAccountPath}", serviceAccountPath);
                        logger.LogInformation("Available files in current directory:");
                        foreach (var file in Directory.GetFiles("."))
                        {
                            logger.LogInformation("   - {FileName}", file);
                        }

                        logger.LogInformation("Available files in apis directory:");
                        if (Directory.Exists("apis"))
                        {
                            foreach (var file in Directory.GetFiles("apis"))
                            {
                                logger.LogInformation("   - apis/{FileName}", file);
                            }
                        }
                        else
                        {
                            logger.LogInformation("   - apis directory does not exist");
                        }

                        // For development/testing, try default credentials
                        try
                        {
                            logger.LogInformation("Trying default credentials...");
                            FirebaseApp.Create(new AppOptions
                            {
                                Credential = GoogleCredential.GetApplicationDefault()
                            });
                            logger.LogInformation("Firebase Admin SDK initialized with default credentials");
                        }
                        catch (Exception ex)
                        {
                            logger.LogError(ex, "❌ Failed to initialize Firebase with default credentials: {ErrorMessage}", ex.Message);
                            logger.LogWarning("⚠️ Firebase authentication and notifications will not work");
                        }
                    }
                }
                else
                {
                    logger.LogWarning("⚠️ Firebase service account path not configured");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "❌ Failed to initialize Firebase Admin SDK: {ErrorMessage}", ex.Message);
                logger.LogWarning("⚠️ Firebase authentication and notifications will not work");
            }
        }
        else
        {
            logger.LogInformation("Firebase Admin SDK already initialized");
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
