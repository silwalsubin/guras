using Microsoft.AspNetCore.Mvc;
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
        private static bool _firebaseInitialized = false;

        public NotificationController(ILogger<NotificationController> logger)
        {
            _logger = logger;
            InitializeFirebase();
        }

        private void InitializeFirebase()
        {
            if (!_firebaseInitialized)
            {
                try
                {
                    // Initialize Firebase Admin SDK
                    FirebaseApp.Create(new AppOptions()
                    {
                        Credential = GoogleCredential.GetApplicationDefault(),
                    });
                    _firebaseInitialized = true;
                    _logger.LogInformation("Firebase Admin SDK initialized successfully");
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to initialize Firebase Admin SDK");
                }
            }
        }

        [HttpPost("register-token")]
        public async Task<IActionResult> RegisterToken([FromBody] RegisterTokenRequest request)
        {
            try
            {
                _logger.LogInformation($"Registering FCM token for user {request.UserId} on {request.Platform}");
                
                // TODO: Store token in database with user association
                // For now, just log it
                _logger.LogInformation($"FCM Token: {request.Token?[..20]}...");
                
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
                            Priority = NotificationPriority.High,
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
                            Priority = NotificationPriority.High,
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