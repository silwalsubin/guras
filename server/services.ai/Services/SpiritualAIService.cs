using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using services.ai.Configuration;
using services.ai.Domain;
using System.Text;

namespace services.ai.Services;

public class SpiritualAIService : ISpiritualAIService
{
    private readonly HttpClient _httpClient;
    private readonly AIServicesConfiguration _config;
    private readonly ILogger<SpiritualAIService> _logger;
    private readonly Dictionary<string, SpiritualTeacherAI> _teachers;

    public SpiritualAIService(
        HttpClient httpClient,
        IOptions<AIServicesConfiguration> config,
        ILogger<SpiritualAIService> logger)
    {
        _httpClient = httpClient;
        _config = config.Value;
        _logger = logger;
        _teachers = InitializeTeachers();
    }

    public async Task<AIResponse> GenerateResponseAsync(AIRequest request)
    {
        var startTime = DateTime.UtcNow;
        
        try
        {
            _logger.LogInformation("Generating AI response for teacher {TeacherId}, question: {Question}", 
                request.TeacherId, request.Question.Substring(0, Math.Min(50, request.Question.Length)));

            // Get teacher information
            if (!_teachers.TryGetValue(request.TeacherId, out var teacher))
            {
                throw new ArgumentException($"Teacher {request.TeacherId} not found");
            }

            // Generate system prompt
            var systemPrompt = GenerateSystemPrompt(teacher, request);
            
            // Generate user prompt
            var userPrompt = GenerateUserPrompt(request);

            // Call OpenAI API
            var openAIRequest = new OpenAIRequest
            {
                Model = _config.DefaultModel,
                Messages = new[]
                {
                    new OpenAIMessage { Role = "system", Content = systemPrompt },
                    new OpenAIMessage { Role = "user", Content = userPrompt }
                },
                MaxTokens = _config.MaxTokens,
                Temperature = _config.Temperature,
                Stop = new[] { "Human:", "User:", "Question:" }
            };

            var response = await CallOpenAIAsync(openAIRequest);
            var processingTime = (int)(DateTime.UtcNow - startTime).TotalMilliseconds;

            return new AIResponse
            {
                Response = response.Response,
                FollowUpQuestions = response.FollowUpQuestions,
                RelatedTeachings = response.RelatedTeachings,
                Practice = response.Practice,
                Source = "ai",
                Confidence = 0.9,
                ProcessingTimeMs = processingTime
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating AI response for teacher {TeacherId}", request.TeacherId);
            
            if (_config.EnableFallback)
            {
                // Get teacher information for fallback
                if (_teachers.TryGetValue(request.TeacherId, out var teacher))
                {
                    return GenerateFallbackResponse(request, teacher);
                }
            }
            
            return new AIResponse
            {
                Response = "I apologize, but I'm experiencing technical difficulties. Please try again later.",
                FollowUpQuestions = new[] { "Can you rephrase your question?", "Would you like to try a different approach?" },
                RelatedTeachings = new[] { "Basic Teachings", "Core Concepts" },
                Source = "fallback",
                Confidence = 0.3,
                ProcessingTimeMs = (int)(DateTime.UtcNow - startTime).TotalMilliseconds,
                Error = ex.Message
            };
        }
    }

    public async Task<AIResponse> GenerateDailyGuidanceAsync(string teacherId, string userId)
    {
        var request = new AIRequest
        {
            Question = "Please provide daily spiritual guidance and inspiration",
            TeacherId = teacherId,
            UserLevel = "intermediate",
            EmotionalState = "seeking"
        };

        return await GenerateResponseAsync(request);
    }

    public async Task<bool> IsServiceAvailableAsync()
    {
        try
        {
            _logger.LogInformation("=== IsServiceAvailableAsync START ===");

            // Check if API key is configured
            if (string.IsNullOrEmpty(_config.OpenAIApiKey))
            {
                _logger.LogWarning("OpenAI API key is not configured");
                return false;
            }

            // Validate API key format (OpenAI keys start with 'sk-')
            if (!_config.OpenAIApiKey.StartsWith("sk-"))
            {
                _logger.LogWarning("OpenAI API key has invalid format. Expected to start with 'sk-', got: {KeyPrefix}",
                    _config.OpenAIApiKey.Substring(0, Math.Min(10, _config.OpenAIApiKey.Length)));
                return false;
            }

            _logger.LogInformation("API Key configured: {Length} chars, format valid", _config.OpenAIApiKey.Length);

            // Check if base URL is configured
            if (string.IsNullOrEmpty(_config.OpenAIBaseUrl))
            {
                _logger.LogWarning("OpenAI base URL is not configured");
                return false;
            }
            _logger.LogInformation("Base URL configured: {BaseUrl}", _config.OpenAIBaseUrl);

            _logger.LogInformation("HttpClient BaseAddress: {BaseAddress}", _httpClient.BaseAddress?.ToString() ?? "NULL");
            _logger.LogInformation("HttpClient Timeout: {Timeout}", _httpClient.Timeout);
            _logger.LogInformation("HttpClient DefaultRequestHeaders count: {Count}", _httpClient.DefaultRequestHeaders.Count());

            // Create a simple test request
            var testRequest = new
            {
                model = _config.DefaultModel,
                messages = new[]
                {
                    new { role = "user", content = "Test" }
                },
                max_tokens = 10,
                temperature = 0.1
            };

            var json = JsonConvert.SerializeObject(testRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            _logger.LogInformation("Request payload: {Json}", json);

            // Remove existing Authorization header if present, then add new one
            _httpClient.DefaultRequestHeaders.Remove("Authorization");
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config.OpenAIApiKey}");
            _logger.LogInformation("Authorization header set");

            var url = "/chat/completions";
            var fullUrl = new Uri(_httpClient.BaseAddress!, url);
            _logger.LogInformation("Making request to: {FullUrl}", fullUrl);

            // Log DNS resolution for debugging
            try
            {
                var host = fullUrl.Host;
                var addresses = System.Net.Dns.GetHostAddresses(host);
                _logger.LogInformation("DNS resolution for {Host}: {Addresses}", host, string.Join(", ", addresses.Select(a => a.ToString())));
            }
            catch (Exception ex)
            {
                _logger.LogWarning("DNS resolution failed: {Error}", ex.Message);
            }

            var response = await _httpClient.PostAsync(url, content);
            
            _logger.LogInformation("OpenAI API test response status: {StatusCode}", response.StatusCode);
            _logger.LogInformation("Response headers: {Headers}", string.Join(", ", response.Headers.Select(h => $"{h.Key}={string.Join(",", h.Value)}")));
            
            if (response.IsSuccessStatusCode)
            {
                var responseContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation("OpenAI API test successful. Response: {Response}", responseContent.Substring(0, Math.Min(200, responseContent.Length)));
                return true;
            }
            else
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError("OpenAI API test failed: {StatusCode} - {ErrorContent}", response.StatusCode, errorContent);
                return false;
            }
        }
        catch (HttpRequestException ex)
        {
            _logger.LogError(ex, "OpenAI API HTTP error: {Message}", ex.Message);
            _logger.LogError("HTTP error details: {Details}", ex.ToString());
            return false;
        }
        catch (TaskCanceledException ex)
        {
            _logger.LogError(ex, "OpenAI API timeout: {Message}", ex.Message);
            _logger.LogError("Timeout details: {Details}", ex.ToString());
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "OpenAI API test failed: {Message}", ex.Message);
            _logger.LogError("Exception details: {Details}", ex.ToString());
            return false;
        }
        finally
        {
            _logger.LogInformation("=== IsServiceAvailableAsync END ===");
        }
    }

    public async Task<Dictionary<string, object>> GetServiceStatsAsync()
    {
        return new Dictionary<string, object>
        {
            ["isAvailable"] = await IsServiceAvailableAsync(),
            ["model"] = _config.DefaultModel,
            ["maxTokens"] = _config.MaxTokens,
            ["temperature"] = _config.Temperature,
            ["timeoutSeconds"] = _config.TimeoutSeconds,
            ["teachersCount"] = _teachers.Count
        };
    }

    private async Task<AIResponse> CallOpenAIAsync(OpenAIRequest request)
    {
        var json = JsonConvert.SerializeObject(request);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        // Remove existing Authorization header if present, then add new one
        _httpClient.DefaultRequestHeaders.Remove("Authorization");
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {_config.OpenAIApiKey}");

        var url = "chat/completions";
        _logger.LogInformation("Making OpenAI API request to: {BaseUrl}{Url}", _httpClient.BaseAddress, url);
        _logger.LogInformation("Request payload: {Json}", json);

        var response = await _httpClient.PostAsync(url, content);
        
        _logger.LogInformation("OpenAI API response status: {StatusCode}", response.StatusCode);
        
        if (!response.IsSuccessStatusCode)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            _logger.LogError("OpenAI API error response: {ErrorContent}", errorContent);
            throw new HttpRequestException($"OpenAI API error: {response.StatusCode} - {errorContent}");
        }

        var responseContent = await response.Content.ReadAsStringAsync();
        _logger.LogInformation("OpenAI API success response received");
        
        var openAIResponse = JsonConvert.DeserializeObject<OpenAIResponse>(responseContent);

        if (openAIResponse?.Choices?.Length == 0)
        {
            throw new InvalidOperationException("No response from OpenAI API");
        }

        var aiResponse = openAIResponse!.Choices[0].Message.Content;
        
        // Parse the AI response to extract structured data
        return ParseAIResponse(aiResponse);
    }

    private AIResponse ParseAIResponse(string aiResponse)
    {
        // Simple parsing - in a real implementation, you might want more sophisticated parsing
        var lines = aiResponse.Split('\n', StringSplitOptions.RemoveEmptyEntries);
        
        var response = new AIResponse
        {
            Response = aiResponse,
            FollowUpQuestions = new[] { "Tell me more about this", "How can I apply this?", "What's the next step?" },
            RelatedTeachings = new[] { "Core Teachings", "Spiritual Practices", "Wisdom Quotes" },
            Practice = "Meditation (20 minutes)"
        };

        // Try to extract follow-up questions if the AI includes them
        var followUpLines = lines.Where(l => l.Trim().StartsWith("Follow-up:") || l.Trim().StartsWith("Questions:")).ToArray();
        if (followUpLines.Any())
        {
            response.FollowUpQuestions = followUpLines.SelectMany(l => 
                l.Split(':', 2)[1].Split(';', StringSplitOptions.RemoveEmptyEntries)
                 .Select(q => q.Trim()).Where(q => !string.IsNullOrEmpty(q))
            ).ToArray();
        }

        return response;
    }

    private string GenerateSystemPrompt(SpiritualTeacherAI teacher, AIRequest request)
    {
        var prompt = $@"You are {teacher.DisplayName}, a spiritual teacher with the following characteristics:

PERSONALITY: {teacher.Personality}
TEACHING STYLE: {teacher.TeachingStyle}
COMMUNICATION TONE: {teacher.CommunicationTone}
CORE TEACHINGS: {string.Join(", ", teacher.CoreTeachings)}
COMMON PHRASES: {string.Join(", ", teacher.CommonPhrases)}

CONTEXT ABOUT THE USER:
- Spiritual Level: {request.UserLevel}
- Current Challenges: {string.Join(", ", request.CurrentChallenges)}
- Spiritual Goals: {string.Join(", ", request.SpiritualGoals)}
- Emotional State: {request.EmotionalState}

INSTRUCTIONS:
1. Respond as {teacher.DisplayName} would, using their teaching style and personality
2. Keep responses conversational and engaging (2-3 paragraphs)
3. Include relevant teachings and practices when appropriate
4. Be compassionate and understanding
5. Use the teacher's common phrases and communication style
6. Provide practical guidance that the user can apply

Remember: You are not just giving advice, you are embodying the wisdom and presence of {teacher.DisplayName}.";

        return prompt;
    }

    private string GenerateUserPrompt(AIRequest request)
    {
        var prompt = $"Question: {request.Question}";
        
        if (request.ConversationHistory.Any())
        {
            prompt += $"\n\nPrevious conversation context:\n{string.Join("\n", request.ConversationHistory.TakeLast(3))}";
        }

        return prompt;
    }

    private AIResponse GenerateFallbackResponse(AIRequest request, SpiritualTeacherAI? teacher)
    {
        var fallbackResponses = new Dictionary<string, string>
        {
            ["osho"] = "Life is a mystery to be lived, not a problem to be solved. Your question touches the very essence of existence. Take a moment to breathe and feel the presence of life within you.",
            ["buddha"] = "Your question shows a sincere heart seeking truth. The path to understanding comes through mindful observation and compassionate inquiry. Be present with your question.",
            ["krishnamurti"] = "You ask an important question. Don't look to me for the answer - look within yourself. The truth is not in words but in your own direct perception.",
            ["vivekananda"] = "Your question reflects a noble spirit seeking knowledge. Remember, you have infinite potential within you. Trust in your own divine nature."
        };

        var response = fallbackResponses.GetValueOrDefault(request.TeacherId, 
            "Thank you for your question. The path of spiritual inquiry is itself valuable, regardless of the answers we find.");

        return new AIResponse
        {
            Response = response,
            FollowUpQuestions = new[] { "Can you tell me more about this?", "How can I explore this further?", "What should I do next?" },
            RelatedTeachings = new[] { "Core Teachings", "Spiritual Practices", "Wisdom Quotes" },
            Practice = "Contemplative Reflection (15 minutes)",
            Source = "fallback",
            Confidence = 0.6,
            ProcessingTimeMs = 0
        };
    }

    private Dictionary<string, SpiritualTeacherAI> InitializeTeachers()
    {
        return new Dictionary<string, SpiritualTeacherAI>
        {
            ["osho"] = new SpiritualTeacherAI
            {
                Id = "osho",
                Name = "osho",
                DisplayName = "Osho",
                Description = "A spiritual teacher who integrated Eastern and Western spiritual traditions",
                TeachingStyle = "Direct, often paradoxical, and playful. Uses humor and provocation to challenge assumptions and awaken consciousness.",
                CoreTeachings = new[] { "meditation", "awareness", "love", "freedom", "celebration", "mind", "heart", "being" },
                CommonPhrases = new[] { "Be here now", "Meditation is not concentration", "Love is the only religion", "Celebrate life", "Drop the mind, be the heart" },
                Personality = "Playful, provocative, mystical, revolutionary, wise, loving",
                CommunicationTone = "playful",
                TeachingApproach = "Direct, often paradoxical, and playful. Uses humor and provocation to challenge assumptions and awaken consciousness."
            },
            ["buddha"] = new SpiritualTeacherAI
            {
                Id = "buddha",
                Name = "buddha",
                DisplayName = "Buddha",
                Description = "The founder of Buddhism, known for his teachings on suffering and the path to enlightenment",
                TeachingStyle = "Gentle, practical, and compassionate. Focuses on understanding suffering and the path to liberation through mindfulness and compassion.",
                CoreTeachings = new[] { "suffering", "compassion", "mindfulness", "impermanence", "enlightenment", "dharma", "sangha", "meditation" },
                CommonPhrases = new[] { "The root of suffering is attachment", "Be present in this moment", "Compassion for all beings", "The Four Noble Truths", "Right mindfulness" },
                Personality = "Wise, compassionate, gentle, patient, enlightened, peaceful",
                CommunicationTone = "gentle",
                TeachingApproach = "Gentle, practical, and compassionate. Focuses on understanding suffering and the path to liberation through mindfulness and compassion."
            },
            ["krishnamurti"] = new SpiritualTeacherAI
            {
                Id = "krishnamurti",
                Name = "krishnamurti",
                DisplayName = "J. Krishnamurti",
                Description = "A philosopher and spiritual teacher who rejected all forms of authority and tradition",
                TeachingStyle = "Direct questioning and inquiry. Challenges all authority and conditioning, encouraging radical self-inquiry and freedom from psychological dependence.",
                CoreTeachings = new[] { "freedom", "awareness", "conditioning", "observation", "inquiry", "revolution", "transformation", "truth" },
                CommonPhrases = new[] { "Freedom from the known", "The observer is the observed", "Question everything", "Be a light unto yourself", "Truth is a pathless land" },
                Personality = "Intense, questioning, revolutionary, independent, profound, challenging",
                CommunicationTone = "firm",
                TeachingApproach = "Direct questioning and inquiry. Challenges all authority and conditioning, encouraging radical self-inquiry and freedom from psychological dependence."
            },
            ["vivekananda"] = new SpiritualTeacherAI
            {
                Id = "vivekananda",
                Name = "vivekananda",
                DisplayName = "Swami Vivekananda",
                Description = "A Hindu monk and philosopher who introduced Vedanta to the Western world",
                TeachingStyle = "Inspiring and practical. Emphasizes self-realization through service, strength, and practical application of spiritual principles.",
                CoreTeachings = new[] { "self-realization", "service", "strength", "divinity", "unity", "practicality", "renunciation", "work" },
                CommonPhrases = new[] { "Arise, awake, and stop not till the goal is reached", "You are divine", "Work is worship", "Strength is life, weakness is death" },
                Personality = "Inspiring, confident, practical, passionate, empowering, service-oriented",
                CommunicationTone = "firm",
                TeachingApproach = "Inspiring and practical. Emphasizes self-realization through service, strength, and practical application of spiritual principles."
            }
        };
    }
}
