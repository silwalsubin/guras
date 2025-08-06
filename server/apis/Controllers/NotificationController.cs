using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;
using services.notifications.Services;

namespace apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly ILogger<NotificationController> _logger;
        private readonly INotificationTokenService _notificationTokenService;

        public NotificationController(ILogger<NotificationController> logger, INotificationTokenService notificationTokenService)
        {
            _logger = logger;
            _notificationTokenService = notificationTokenService;
        }

        // Static method to get registered tokens (for backward compatibility)
        public static List<string> GetStoredTokens()
        {
            // This will be handled by the service, but keeping for backward compatibility
            // In a real implementation, you might want to inject the service or use a different approach
            return new List<string>();
        }

        [HttpPost("register-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterToken([FromBody] RegisterTokenRequest request)
        {
            try
            {
                _logger.LogInformation($"Registering FCM token for user {request.UserId} on {request.Platform}");
                
                _notificationTokenService.RegisterToken(request.Token, request.Platform, request.UserId);
                
                return Ok(new { success = true, message = "Token registered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering FCM token");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to register token",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationRequest request)
        {
            try
            {
                _logger.LogInformation($"Sending FCM notification: {request.Title}");

                if (string.IsNullOrEmpty(request.Token))
                {
                    return BadRequest(new { success = false, message = "FCM token is required" });
                }

                var message = new Message()
                {
                    Token = request.Token,
                    Notification = new Notification()
                    {
                        Title = request.Title,
                        Body = request.Body
                    },
                    Data = request.Data ?? new Dictionary<string, string>(),
                    Android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            Sound = "default",
                            Priority = NotificationPriority.HIGH,
                            ChannelId = "daily-quotes"
                        }
                    },
                    Apns = new ApnsConfig()
                    {
                        Aps = new Aps()
                        {
                            Sound = "default",
                            Badge = 1
                        }
                    }
                };

                var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation($"FCM notification sent successfully: {response}");

                return Ok(new { success = true, messageId = response });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending FCM notification");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to send notification",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("registered-tokens")]
        [AllowAnonymous]
        public IActionResult GetRegisteredTokens()
        {
            try
            {
                var userTokens = _notificationTokenService.GetUserTokens();
                var tokenUsers = _notificationTokenService.GetTokenUsers();
                var (totalUsers, totalTokens) = _notificationTokenService.GetTokenStatistics();
                
                return Ok(new { 
                    success = true, 
                    userTokens = userTokens,
                    tokenUsers = tokenUsers,
                    totalUsers = totalUsers,
                    totalTokens = totalTokens
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting registered tokens");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to get tokens",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("test-notification")]
        [AllowAnonymous]
        public async Task<IActionResult> SendTestNotification()
        {
            try
            {
                var storedTokens = _notificationTokenService.GetStoredTokens();
                if (!storedTokens.Any())
                {
                    return BadRequest(new { success = false, message = "No registered tokens found" });
                }

                var testQuote = new QuoteData
                {
                    Text = "This is a test notification from the server!",
                    Author = "Test System",
                    Category = "test"
                };

                var request = new SendQuoteNotificationRequest
                {
                    UserTokens = storedTokens,
                    Quote = testQuote
                };

                // Send the notification
                return SendQuoteNotification(request).Result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test notification");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to send test notification",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpGet("firebase-status")]
        [AllowAnonymous]
        public IActionResult GetFirebaseStatus()
        {
            try
            {
                var firebaseApp = FirebaseApp.DefaultInstance;
                var isInitialized = firebaseApp != null;
                var (_, totalTokens) = _notificationTokenService.GetTokenStatistics();
                
                return Ok(new { 
                    success = true, 
                    firebaseInitialized = isInitialized,
                    registeredTokensCount = totalTokens,
                    message = isInitialized ? "Firebase is properly configured" : "Firebase is not configured"
                });
            }
            catch (Exception ex)
            {
                var (_, totalTokens) = _notificationTokenService.GetTokenStatistics();
                return Ok(new { 
                    success = false, 
                    firebaseInitialized = false,
                    registeredTokensCount = totalTokens,
                    message = $"Firebase error: {ex.Message}"
                });
            }
        }

        [HttpPost("send-quote")]
        public async Task<IActionResult> SendQuoteNotification([FromBody] SendQuoteNotificationRequest request)
        {
            try
            {
                _logger.LogInformation($"Sending quote notification to {request.UserTokens?.Count ?? 0} users");

                if (request.UserTokens == null || !request.UserTokens.Any())
                {
                    return BadRequest(new { success = false, message = "No user tokens provided" });
                }



                var messages = request.UserTokens.Select(token => new Message()
                {
                    Token = token,
                    Notification = new Notification()
                    {
                        Title = "🧘 Daily Wisdom",
                        Body = $"\"{request.Quote.Text}\" - {request.Quote.Author}"
                    },
                    Data = new Dictionary<string, string>
                    {
                        ["quote"] = JsonSerializer.Serialize(request.Quote),
                        ["type"] = "daily_quote",
                        ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString()
                    },
                    Android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            Sound = "default",
                            Priority = NotificationPriority.HIGH,
                            ChannelId = "daily-quotes"
                        }
                    },
                    Apns = new ApnsConfig()
                    {
                        Aps = new Aps()
                        {
                            Sound = "default",
                            Badge = 1,
                            ContentAvailable = true,
                            Alert = new ApsAlert()
                            {
                                Title = "🧘 Daily Wisdom",
                                Body = $"\"{request.Quote.Text}\" - {request.Quote.Author}"
                            }
                        },
                        Headers = new Dictionary<string, string>
                        {
                            ["apns-priority"] = "10",
                            ["apns-push-type"] = "alert"
                        }
                    }
                }).ToList();

                var response = await FirebaseMessaging.DefaultInstance.SendAllAsync(messages);
                _logger.LogInformation($"Quote notifications sent: {response.SuccessCount} successful, {response.FailureCount} failed");

                return Ok(new 
                { 
                    success = true, 
                    successCount = response.SuccessCount,
                    failureCount = response.FailureCount
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending quote notifications");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to send notifications",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("test-fcm-connection")]
        [AllowAnonymous]
        public async Task<IActionResult> TestFCMConnection([FromBody] TestFCMConnectionRequest request)
        {
            try
            {
                var firebaseApp = FirebaseApp.DefaultInstance;
                if (firebaseApp == null)
                {
                    return BadRequest(new { success = false, message = "Firebase not initialized" });
                }

                if (string.IsNullOrEmpty(request.Token))
                {
                    return BadRequest(new { success = false, message = "Token is required" });
                }

                _logger.LogInformation($"Testing FCM connection with token: {request.Token[..20]}...");

                // Try to send a test message to the provided token
                var testMessage = new Message()
                {
                    Token = request.Token,
                    Notification = new Notification()
                    {
                        Title = request.Title ?? "🧘 FCM Connection Test",
                        Body = request.Body ?? "This is a test message to verify FCM connectivity!"
                    },
                    Data = new Dictionary<string, string>
                    {
                        ["type"] = "fcm_connection_test",
                        ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString(),
                        ["test"] = "true"
                    },
                    Android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            Sound = "default",
                            Priority = NotificationPriority.HIGH,
                            ChannelId = "test-notifications"
                        }
                    },
                    Apns = new ApnsConfig()
                    {
                        Aps = new Aps()
                        {
                            Sound = "default",
                            Badge = 1,
                            ContentAvailable = true,
                            Alert = new ApsAlert()
                            {
                                Title = request.Title ?? "🧘 FCM Connection Test",
                                Body = request.Body ?? "This is a test message to verify FCM connectivity!"
                            }
                        },
                        Headers = new Dictionary<string, string>
                        {
                            ["apns-priority"] = "10",
                            ["apns-push-type"] = "alert"
                        }
                    }
                };

                try
                {
                    var response = await FirebaseMessaging.DefaultInstance.SendAsync(testMessage);
                    _logger.LogInformation($"FCM connection test successful: {response}");
                    
                    return Ok(new { 
                        success = true, 
                        message = "FCM connection test completed successfully",
                        messageId = response,
                        token = request.Token[..20] + "..."
                    });
                }
                catch (FirebaseMessagingException ex)
                {
                    _logger.LogError(ex, "Firebase messaging error during connection test");
                    return StatusCode(500, new { 
                        success = false, 
                        message = "FCM connection test failed",
                        error = ex.Message,
                        errorType = ex.GetType().Name,
                        stackTrace = ex.StackTrace,
                        token = request.Token[..20] + "..."
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error during FCM connection test");
                return StatusCode(500, new { 
                    success = false, 
                    message = "FCM connection test failed",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }

        [HttpPost("test-token")]
        [AllowAnonymous]
        public async Task<IActionResult> TestSpecificToken([FromBody] TestTokenRequest request)
        {
            try
            {
                if (string.IsNullOrEmpty(request.Token))
                {
                    return BadRequest(new { success = false, message = "Token is required" });
                }

                _logger.LogInformation($"Testing notification to specific token: {request.Token[..20]}...");

                var message = new Message()
                {
                    Token = request.Token,
                    Notification = new Notification()
                    {
                        Title = request.Title ?? "🧘 Test Notification",
                        Body = request.Body ?? "This is a test notification sent to a specific token!"
                    },
                    Data = new Dictionary<string, string>
                    {
                        ["type"] = "test_token",
                        ["timestamp"] = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds().ToString(),
                        ["test"] = "true"
                    },
                    Android = new AndroidConfig()
                    {
                        Notification = new AndroidNotification()
                        {
                            Sound = "default",
                            Priority = NotificationPriority.HIGH,
                            ChannelId = "test-notifications"
                        }
                    },
                    Apns = new ApnsConfig()
                    {
                        Aps = new Aps()
                        {
                            Sound = "default",
                            Badge = 1,
                            ContentAvailable = true,
                            Alert = new ApsAlert()
                            {
                                Title = request.Title ?? "🧘 Test Notification",
                                Body = request.Body ?? "This is a test notification sent to a specific token!"
                            }
                        },
                        Headers = new Dictionary<string, string>
                        {
                            ["apns-priority"] = "10",
                            ["apns-push-type"] = "alert"
                        }
                    }
                };

                var response = await FirebaseMessaging.DefaultInstance.SendAsync(message);
                _logger.LogInformation($"Test notification sent successfully: {response}");

                return Ok(new { 
                    success = true, 
                    messageId = response,
                    message = "Test notification sent successfully"
                });
            }
            catch (FirebaseMessagingException ex)
            {
                _logger.LogError(ex, "Firebase messaging error when testing token");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to send test notification",
                    error = ex.Message,
                    errorType = "FirebaseMessagingException",
                    stackTrace = ex.StackTrace
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing specific token");
                return StatusCode(500, new { 
                    success = false, 
                    message = "Failed to send test notification",
                    error = ex.Message,
                    errorType = ex.GetType().Name,
                    stackTrace = ex.StackTrace
                });
            }
        }
    }

    public class RegisterTokenRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        public string Platform { get; set; } = string.Empty;
        
        [Required]
        public string UserId { get; set; } = string.Empty;
    }

    public class SendNotificationRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        public Dictionary<string, string>? Data { get; set; }
        
        public string Platform { get; set; } = string.Empty;
    }

    public class SendQuoteNotificationRequest
    {
        [Required]
        public List<string> UserTokens { get; set; } = new();
        
        [Required]
        public QuoteData Quote { get; set; } = new();
    }

    public class QuoteData
    {
        public string Text { get; set; } = string.Empty;
        public string Author { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
    }

    public class TestTokenRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }

    public class TestFCMConnectionRequest
    {
        [Required]
        public string Token { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
    }
} 