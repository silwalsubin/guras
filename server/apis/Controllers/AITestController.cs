using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using services.ai.Services;
using services.ai.Configuration;
using utilities.Controllers;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AITestController : BaseController
{
    private readonly ISpiritualAIService _aiService;
    private readonly ILogger<AITestController> _logger;
    private readonly AIServicesConfiguration _aiConfig;

    public AITestController(ISpiritualAIService aiService, ILogger<AITestController> logger, IOptions<AIServicesConfiguration> aiConfig)
    {
        _aiService = aiService;
        _logger = logger;
        _aiConfig = aiConfig.Value;
    }

    /// <summary>
    /// Simple AI test endpoint - no authentication required
    /// </summary>
    /// <param name="message">Test message to send to AI</param>
    /// <returns>AI response</returns>
    [HttpPost("chat")]
    [AllowAnonymous]
    public async Task<IActionResult> TestChat([FromBody] TestChatRequest request)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(request.Message))
            {
                return BadRequest("Message is required");
            }

            _logger.LogInformation("AI Test - Processing message: {Message}", request.Message);

            // Create a simple AI request
            var aiRequest = new services.ai.Domain.AIRequest
            {
                Question = request.Message,
                TeacherId = "osho", // Default to Osho for testing
                UserLevel = "beginner",
                CurrentChallenges = new[] { "testing" },
                SpiritualGoals = new[] { "learning" },
                RecentInsights = new string[0],
                PracticeHistory = new string[0],
                EmotionalState = "curious",
                ConversationHistory = new string[0]
            };

            var response = await _aiService.GenerateResponseAsync(aiRequest);

            _logger.LogInformation("AI Test - Response generated successfully in {ProcessingTime}ms", response.ProcessingTimeMs);

            return SuccessResponse(new
            {
                message = request.Message,
                response = response.Response,
                source = response.Source,
                confidence = response.Confidence,
                processingTimeMs = response.ProcessingTimeMs,
                timestamp = DateTime.UtcNow
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI Test - Error processing message: {Message}", request.Message);
            return ErrorResponse($"AI test failed: {ex.Message}", 500);
        }
    }

    /// <summary>
    /// Test AI service health
    /// </summary>
    /// <returns>Service health status</returns>
    [HttpGet("health")]
    [AllowAnonymous]
    public async Task<IActionResult> TestHealth()
    {
        try
        {
            var isAvailable = await _aiService.IsServiceAvailableAsync();
            var stats = await _aiService.GetServiceStatsAsync();

            // Temporarily expose API key for debugging
            var apiKeyStatus = string.IsNullOrEmpty(_aiConfig.OpenAIApiKey) ? "NOT SET" : 
                              _aiConfig.OpenAIApiKey.Length > 10 ? 
                              $"SET (ends with: ...{_aiConfig.OpenAIApiKey.Substring(_aiConfig.OpenAIApiKey.Length - 4)})" : 
                              "INVALID";

            // Check configuration validity
            var configValid = !string.IsNullOrEmpty(_aiConfig.OpenAIApiKey) && 
                             !string.IsNullOrEmpty(_aiConfig.OpenAIBaseUrl) &&
                             !string.IsNullOrEmpty(_aiConfig.DefaultModel);

            return SuccessResponse(new
            {
                isAvailable,
                stats,
                timestamp = DateTime.UtcNow,
                message = isAvailable ? "AI service is working!" : "AI service is not available",
                apiKeyStatus = apiKeyStatus,
                apiKeyLength = _aiConfig.OpenAIApiKey?.Length ?? 0,
                configValid = configValid,
                configInfo = new
                {
                    model = _aiConfig.DefaultModel,
                    baseUrl = _aiConfig.OpenAIBaseUrl,
                    maxTokens = _aiConfig.MaxTokens,
                    temperature = _aiConfig.Temperature,
                    enableFallback = _aiConfig.EnableFallback
                },
                diagnostics = new
                {
                    hasApiKey = !string.IsNullOrEmpty(_aiConfig.OpenAIApiKey),
                    hasBaseUrl = !string.IsNullOrEmpty(_aiConfig.OpenAIBaseUrl),
                    hasModel = !string.IsNullOrEmpty(_aiConfig.DefaultModel),
                    apiKeyPrefix = _aiConfig.OpenAIApiKey?.Substring(0, Math.Min(10, _aiConfig.OpenAIApiKey?.Length ?? 0)) ?? "N/A"
                }
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI Test - Error checking health");
            return ErrorResponse($"Health check failed: {ex.Message}", 500);
        }
    }

    /// <summary>
    /// Test AI service with detailed error information
    /// </summary>
    /// <returns>Detailed test results including exact errors</returns>
    [HttpGet("detailed-test")]
    [AllowAnonymous]
    public async Task<IActionResult> DetailedTest()
    {
        var results = new List<TestResult>();

        // Test 1: Configuration validation
        try
        {
            var configValid = !string.IsNullOrEmpty(_aiConfig.OpenAIApiKey) && 
                             !string.IsNullOrEmpty(_aiConfig.OpenAIBaseUrl) &&
                             !string.IsNullOrEmpty(_aiConfig.DefaultModel);
            
            results.Add(new TestResult
            {
                Test = "Configuration Validation",
                Status = configValid ? "PASS" : "FAIL",
                Details = configValid ? "All required configuration values are present" : "Missing required configuration values",
                Errors = configValid ? new string[0] : new[]
                {
                    string.IsNullOrEmpty(_aiConfig.OpenAIApiKey) ? "API Key is missing" : null,
                    string.IsNullOrEmpty(_aiConfig.OpenAIBaseUrl) ? "Base URL is missing" : null,
                    string.IsNullOrEmpty(_aiConfig.DefaultModel) ? "Model is missing" : null
                }.Where(e => e != null).ToArray()
            });
        }
        catch (Exception ex)
        {
            results.Add(new TestResult
            {
                Test = "Configuration Validation",
                Status = "ERROR",
                Details = $"Exception during configuration validation: {ex.Message}",
                Errors = new[] { ex.ToString() }
            });
        }

        // Test 2: Service availability check
        try
        {
            var isAvailable = await _aiService.IsServiceAvailableAsync();
            results.Add(new TestResult
            {
                Test = "Service Availability",
                Status = isAvailable ? "PASS" : "FAIL",
                Details = isAvailable ? "AI service is available" : "AI service is not available",
                Errors = isAvailable ? new string[0] : new[] { "Service availability check failed" }
            });
        }
        catch (Exception ex)
        {
            results.Add(new TestResult
            {
                Test = "Service Availability",
                Status = "ERROR",
                Details = $"Exception during availability check: {ex.Message}",
                Errors = new[] { ex.ToString() }
            });
        }

        // Test 3: Direct API call test
        try
        {
            var testRequest = new services.ai.Domain.AIRequest
            {
                Question = "Hello, this is a test message.",
                TeacherId = "osho",
                UserLevel = "beginner",
                CurrentChallenges = new[] { "testing" },
                SpiritualGoals = new[] { "learning" },
                RecentInsights = new string[0],
                PracticeHistory = new string[0],
                EmotionalState = "curious",
                ConversationHistory = new string[0]
            };

            var response = await _aiService.GenerateResponseAsync(testRequest);
            results.Add(new TestResult
            {
                Test = "Direct API Call",
                Status = "PASS",
                Details = $"Successfully generated response in {response.ProcessingTimeMs}ms",
                Errors = new string[0],
                Response = new
                {
                    response = response.Response,
                    source = response.Source,
                    confidence = response.Confidence,
                    processingTimeMs = response.ProcessingTimeMs
                }
            });
        }
        catch (Exception ex)
        {
            results.Add(new TestResult
            {
                Test = "Direct API Call",
                Status = "ERROR",
                Details = $"Exception during direct API call: {ex.Message}",
                Errors = new[] { ex.ToString() },
                InnerException = ex.InnerException?.ToString(),
                StackTrace = ex.StackTrace
            });
        }

        // Test 4: Network connectivity test (if possible)
        try
        {
            using var httpClient = new HttpClient();
            httpClient.Timeout = TimeSpan.FromSeconds(10);
            
            // Test connectivity to a known external endpoint first
            var testUrl = "https://httpbin.org/get";
            var response = await httpClient.GetAsync(testUrl);
            
            results.Add(new TestResult
            {
                Test = "Network Connectivity",
                Status = response.IsSuccessStatusCode ? "PASS" : "FAIL",
                Details = response.IsSuccessStatusCode ? 
                    $"Successfully reached external endpoint: {testUrl}" : 
                    $"HTTP {response.StatusCode}: {response.ReasonPhrase}",
                Errors = response.IsSuccessStatusCode ? new string[0] : new[] { $"HTTP {response.StatusCode}: {response.ReasonPhrase}" }
            });
        }
        catch (Exception ex)
        {
            results.Add(new TestResult
            {
                Test = "Network Connectivity",
                Status = "ERROR",
                Details = $"Exception during network test: {ex.Message}",
                Errors = new[] { ex.ToString() }
            });
        }

        return SuccessResponse(new
        {
            timestamp = DateTime.UtcNow,
            configuration = new
            {
                apiKeyStatus = string.IsNullOrEmpty(_aiConfig.OpenAIApiKey) ? "NOT SET" : 
                              _aiConfig.OpenAIApiKey.Length > 10 ? 
                              $"SET (ends with: ...{_aiConfig.OpenAIApiKey.Substring(_aiConfig.OpenAIApiKey.Length - 4)})" : 
                              "INVALID",
                apiKeyLength = _aiConfig.OpenAIApiKey?.Length ?? 0,
                baseUrl = _aiConfig.OpenAIBaseUrl,
                model = _aiConfig.DefaultModel,
                maxTokens = _aiConfig.MaxTokens,
                temperature = _aiConfig.Temperature,
                enableFallback = _aiConfig.EnableFallback
            },
            tests = results,
            summary = new
            {
                totalTests = results.Count,
                passedTests = results.Count(r => r.Status == "PASS"),
                failedTests = results.Count(r => r.Status == "FAIL"),
                errorTests = results.Count(r => r.Status == "ERROR"),
                overallStatus = results.All(r => r.Status == "PASS") ? "ALL_PASS" : 
                              results.Any(r => r.Status == "ERROR") ? "ERRORS" : "SOME_FAILED"
            }
        });
    }

    /// <summary>
    /// Simple ping test
    /// </summary>
    /// <returns>Pong response</returns>
    [HttpGet("ping")]
    [AllowAnonymous]
    public IActionResult Ping()
    {
        return SuccessResponse(new
        {
            message = "AI Test Controller is alive!",
            timestamp = DateTime.UtcNow
        });
    }
}

public class TestChatRequest
{
    public string Message { get; set; } = string.Empty;
}

public class TestResult
{
    public string Test { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string[] Errors { get; set; } = new string[0];
    public object? Response { get; set; }
    public string? InnerException { get; set; }
    public string? StackTrace { get; set; }
}
