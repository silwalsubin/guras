namespace services.ai.Configuration;

public class AIServicesConfiguration
{
    public string OpenAIApiKey { get; set; } = string.Empty;
    public string OpenAIBaseUrl { get; set; } = "https://api.openai.com";
    public string DefaultModel { get; set; } = "gpt-4";
    public int MaxTokens { get; set; } = 500;
    public double Temperature { get; set; } = 0.7;
    public int TimeoutSeconds { get; set; } = 30;
    public bool EnableFallback { get; set; } = true;
}
