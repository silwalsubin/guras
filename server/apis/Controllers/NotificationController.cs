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
        
        // In-memory storage for FCM tokens with user associations (for testing - replace with database in production)
        private static readonly Dictionary<string, List<string>> _userTokens = new(); // userId -> List<token>
        private static readonly Dictionary<string, string> _tokenUsers = new(); // token -> userId
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
                return _tokenUsers.Keys.ToList();
            }
        }

        [HttpPost("register-token")]
        [AllowAnonymous]
        public async Task<IActionResult> RegisterToken([FromBody] RegisterTokenRequest request)
        {
            try
            {
                _logger.LogInformation($"Registering FCM token for user {request.UserId} on {request.Platform}");
                
                // Store token with user association in memory (for testing - replace with database in production)
                lock (_lock)
                {
                    // Remove token from previous user if it exists
                    if (_tokenUsers.ContainsKey(request.Token))
                    {
                        var previousUserId = _tokenUsers[request.Token];
                        if (_userTokens.ContainsKey(previousUserId))
                        {
                            _userTokens[previousUserId].Remove(request.Token);
                            if (_userTokens[previousUserId].Count == 0)
                            {
                                _userTokens.Remove(previousUserId);
                            }
                        }
                        _logger.LogInformation($"Token reassigned from user {previousUserId} to user {request.UserId}");
                    }

                    // Add token to new user
                    if (!_userTokens.ContainsKey(request.UserId))
                    {
                        _userTokens[request.UserId] = new List<string>();
                    }
                    _userTokens[request.UserId].Add(request.Token);
                    _tokenUsers[request.Token] = request.UserId;
                    
                    _logger.LogInformation($"FCM Token stored for user {request.UserId}: {request.Token?[..20]}... (Total users: {_userTokens.Count}, Total tokens: {_tokenUsers.Count})");
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
                        userTokens = _userTokens,
                        tokenUsers = _tokenUsers,
                        totalUsers = _userTokens.Count,
                        totalTokens = _tokenUsers.Count
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
                    if (!_tokenUsers.Any())
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
                        UserTokens = _tokenUsers.Keys.ToList(),
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
                    registeredTokensCount = _tokenUsers.Count,
                    message = isInitialized ? "Firebase is properly configured" : "Firebase is not configured"
                });
            }
            catch (Exception ex)
            {
                return Ok(new { 
                    success = false, 
                    firebaseInitialized = false,
                    registeredTokensCount = _tokenUsers.Count,
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