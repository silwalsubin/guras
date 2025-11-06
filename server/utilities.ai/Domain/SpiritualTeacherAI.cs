namespace utilities.ai.Domain;

public class SpiritualTeacherAI
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string DisplayName { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string TeachingStyle { get; set; } = string.Empty;
    public string[] CoreTeachings { get; set; } = Array.Empty<string>();
    public string[] CommonPhrases { get; set; } = Array.Empty<string>();
    public string Personality { get; set; } = string.Empty;
    public string CommunicationTone { get; set; } = string.Empty;
    public string TeachingApproach { get; set; } = string.Empty;
}

public class AIRequest
{
    public string Question { get; set; } = string.Empty;
    public string TeacherId { get; set; } = string.Empty;
    public string UserLevel { get; set; } = "beginner";
    public string[] CurrentChallenges { get; set; } = Array.Empty<string>();
    public string[] SpiritualGoals { get; set; } = Array.Empty<string>();
    public string[] RecentInsights { get; set; } = Array.Empty<string>();
    public string[] PracticeHistory { get; set; } = Array.Empty<string>();
    public string EmotionalState { get; set; } = "neutral";
    public string[] ConversationHistory { get; set; } = Array.Empty<string>();
}

public class AIResponse
{
    public string Response { get; set; } = string.Empty;
    public string[] FollowUpQuestions { get; set; } = Array.Empty<string>();
    public string[] RelatedTeachings { get; set; } = Array.Empty<string>();
    public string? Practice { get; set; }
    public string Source { get; set; } = "ai";
    public double Confidence { get; set; }
    public int ProcessingTimeMs { get; set; }
    public string? Error { get; set; }
}

public class OpenAIMessage
{
    public string Role { get; set; } = string.Empty;
    public string Content { get; set; } = string.Empty;
    public string? Refusal { get; set; }
    public object[]? Annotations { get; set; }
}

public class OpenAIRequest
{
    public string Model { get; set; } = string.Empty;
    public OpenAIMessage[] Messages { get; set; } = Array.Empty<OpenAIMessage>();
    public int MaxTokens { get; set; }
    public double Temperature { get; set; }
    public string[] Stop { get; set; } = Array.Empty<string>();
}

public class OpenAIResponse
{
    public string Id { get; set; } = string.Empty;
    public string Object { get; set; } = string.Empty;
    public long Created { get; set; }
    public string Model { get; set; } = string.Empty;
    public OpenAIChoice[] Choices { get; set; } = Array.Empty<OpenAIChoice>();
    public OpenAIUsage Usage { get; set; } = new();
    public string? ServiceTier { get; set; }
    public string? SystemFingerprint { get; set; }
}

public class OpenAIChoice
{
    public int Index { get; set; }
    public OpenAIMessage Message { get; set; } = new();
    public string FinishReason { get; set; } = string.Empty;
    public object? Logprobs { get; set; }
}

public class OpenAIUsage
{
    public int PromptTokens { get; set; }
    public int CompletionTokens { get; set; }
    public int TotalTokens { get; set; }
    public object? PromptTokensDetails { get; set; }
    public object? CompletionTokensDetails { get; set; }
}
