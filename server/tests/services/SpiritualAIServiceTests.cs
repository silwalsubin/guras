using System.Net;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Moq;
using utilities.ai.Configuration;
using utilities.ai.Services;
using Xunit;
using FluentAssertions;

namespace tests.services;

public class SpiritualAIServiceTests
{
    private readonly Mock<ILogger<SpiritualAIService>> _mockLogger;
    private readonly AIServicesConfiguration _config;

    public SpiritualAIServiceTests()
    {
        _mockLogger = new Mock<ILogger<SpiritualAIService>>();
        _config = new AIServicesConfiguration
        {
            OpenAIApiKey = "sk-test-key-12345",
            OpenAIBaseUrl = "https://api.openai.com",
            DefaultModel = "gpt-4o-mini",
            MaxTokens = 500,
            Temperature = 0.7,
            TimeoutSeconds = 30
        };
    }

    private SpiritualAIService CreateService(HttpClient httpClient)
    {
        var options = Options.Create(_config);
        return new SpiritualAIService(httpClient, options, _mockLogger.Object);
    }

    [Fact]
    public async Task IsServiceAvailableAsync_WithInvalidApiKey_ReturnsFalse()
    {
        // Arrange
        var invalidConfig = new AIServicesConfiguration
        {
            OpenAIApiKey = "invalid-key-without-sk-prefix",
            OpenAIBaseUrl = "https://api.openai.com",
            DefaultModel = "gpt-4o-mini",
            MaxTokens = 500,
            Temperature = 0.7,
            TimeoutSeconds = 30
        };

        var httpClient = new HttpClient
        {
            BaseAddress = new Uri(invalidConfig.OpenAIBaseUrl),
            Timeout = TimeSpan.FromSeconds(invalidConfig.TimeoutSeconds)
        };

        var options = Options.Create(invalidConfig);
        var service = new SpiritualAIService(httpClient, options, _mockLogger.Object);

        // Act
        var result = await service.IsServiceAvailableAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsServiceAvailableAsync_WithEmptyApiKey_ReturnsFalse()
    {
        // Arrange
        var invalidConfig = new AIServicesConfiguration
        {
            OpenAIApiKey = "",
            OpenAIBaseUrl = "https://api.openai.com",
            DefaultModel = "gpt-4o-mini",
            MaxTokens = 500,
            Temperature = 0.7,
            TimeoutSeconds = 30
        };

        var httpClient = new HttpClient
        {
            BaseAddress = new Uri(invalidConfig.OpenAIBaseUrl),
            Timeout = TimeSpan.FromSeconds(invalidConfig.TimeoutSeconds)
        };

        var options = Options.Create(invalidConfig);
        var service = new SpiritualAIService(httpClient, options, _mockLogger.Object);

        // Act
        var result = await service.IsServiceAvailableAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public async Task IsServiceAvailableAsync_WithEmptyBaseUrl_ReturnsFalse()
    {
        // Arrange
        var invalidConfig = new AIServicesConfiguration
        {
            OpenAIApiKey = "sk-test-key-12345",
            OpenAIBaseUrl = "",
            DefaultModel = "gpt-4o-mini",
            MaxTokens = 500,
            Temperature = 0.7,
            TimeoutSeconds = 30
        };

        var httpClient = new HttpClient
        {
            BaseAddress = new Uri("https://api.openai.com"),
            Timeout = TimeSpan.FromSeconds(invalidConfig.TimeoutSeconds)
        };

        var options = Options.Create(invalidConfig);
        var service = new SpiritualAIService(httpClient, options, _mockLogger.Object);

        // Act
        var result = await service.IsServiceAvailableAsync();

        // Assert
        result.Should().BeFalse();
    }

    [Fact]
    public void UriConstruction_WithBaseAddressAndRelativePath_ConstructsCorrectUrl()
    {
        // Arrange
        var baseAddress = new Uri("https://api.openai.com");
        var relativePath = "v1/chat/completions";

        // Act
        var fullUrl = new Uri(baseAddress, relativePath);

        // Assert
        fullUrl.ToString().Should().Be("https://api.openai.com/v1/chat/completions");
    }

    [Fact]
    public void UriConstruction_WithTrailingSlashInBase_ConstructsCorrectUrl()
    {
        // Arrange
        var baseAddress = new Uri("https://api.openai.com/");
        var relativePath = "v1/chat/completions";

        // Act
        var fullUrl = new Uri(baseAddress, relativePath);

        // Assert
        fullUrl.ToString().Should().Be("https://api.openai.com/v1/chat/completions");
    }

    [Fact]
    public void UriConstruction_ExtractsHostCorrectly()
    {
        // Arrange
        var baseAddress = new Uri("https://api.openai.com");
        var relativePath = "v1/chat/completions";
        var fullUrl = new Uri(baseAddress, relativePath);

        // Act
        var host = fullUrl.Host;

        // Assert
        host.Should().Be("api.openai.com");
    }

    [Fact]
    public void UriConstruction_WithNullBaseAddress_ThrowsException()
    {
        // Arrange
        Uri? baseAddress = null;
        var relativePath = "/chat/completions";

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => new Uri(baseAddress!, relativePath));
    }
}

