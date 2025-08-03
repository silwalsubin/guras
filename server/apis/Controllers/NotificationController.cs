using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.ComponentModel.DataAnnotations;
using System.Text.Json;
using FirebaseAdmin;
using FirebaseAdmin.Messaging;
using Google.Apis.Auth.OAuth2;

namespace apis.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationController : ControllerBase
    {
        private readonly ILogger<NotificationController> _logger;
        
        // In-memory storage for FCM tokens (for testing - replace with database in production)
        private static readonly List<string> _registeredTokens = new();
        private static readonly object _lock = new();

        public NotificationController(ILogger<NotificationController> logger)
        {
            _logger = logger;
        }

        // Static method to get registered tokens (for scheduler access)
        public static List<string> GetStoredTokens()
        {
            lock (_lock)
            {
                return new List<string>(_registeredTokens);
            }
        }

        [HttpPost("register-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterToken([FromBody] RegisterTokenRequest request)
        {
            try
            {
                _logger.LogInformation($"Registering FCM token for user {request.UserId} on {request.Platform}");
                
                // Store token in memory (for testing - replace with database in production)
                lock (_lock)
                {
                    if (!_registeredTokens.Contains(request.Token))
                    {
                        _registeredTokens.Add(request.Token);
                        _logger.LogInformation($"FCM Token stored: {request.Token?[..20]}... (Total tokens: {_registeredTokens.Count})");
                    }
                }
                
                return Ok(new { success = true, message = "Token registered successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering FCM token");
                return StatusCode(500, new { success = false, message = "Failed to register token" });
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
                return StatusCode(500, new { success = false, message = "Failed to send notification" });
            }
        }

        [HttpGet("registered-tokens")]
        [AllowAnonymous]
        public IActionResult GetRegisteredTokens()
        {
            try
            {
                lock (_lock)
                {
                    return Ok(new { 
                        success = true, 
                        tokenCount = _registeredTokens.Count,
                        tokens = _registeredTokens.Select(t => t[..20] + "...").ToList()
                    });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting registered tokens");
                return StatusCode(500, new { success = false, message = "Failed to get tokens" });
            }
        }

        [HttpPost("test-notification")]
        [AllowAnonymous]
        public async Task<IActionResult> SendTestNotification()
        {
            try
            {
                lock (_lock)
                {
                    if (!_registeredTokens.Any())
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
                        UserTokens = _registeredTokens,
                        Quote = testQuote
                    };

                    // Send the notification
                    return SendQuoteNotification(request).Result;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error sending test notification");
                return StatusCode(500, new { success = false, message = "Failed to send test notification" });
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
                
                return Ok(new { 
                    success = true, 
                    firebaseInitialized = isInitialized,
                    registeredTokensCount = _registeredTokens.Count,
                    message = isInitialized ? "Firebase is properly configured" : "Firebase is not configured"
                });
            }
            catch (Exception ex)
            {
                return Ok(new { 
                    success = false, 
                    firebaseInitialized = false,
                    registeredTokensCount = _registeredTokens.Count,
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
                            Badge = 1
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
                return StatusCode(500, new { success = false, message = "Failed to send notifications" });
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
} 