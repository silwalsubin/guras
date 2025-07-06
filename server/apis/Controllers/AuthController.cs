using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using apis.Authentication;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ILogger<AuthController> _logger;
    private readonly IFirebaseService _firebaseService;

    public AuthController(ILogger<AuthController> logger, IFirebaseService firebaseService)
    {
        _logger = logger;
        _firebaseService = firebaseService;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var firebaseToken = await _firebaseService.VerifyIdTokenAsync(request.IdToken);
            var user = await _firebaseService.GetUserAsync(firebaseToken.Uid);

            var response = new LoginResponse
            {
                Uid = user.Uid,
                Email = user.Email,
                DisplayName = user.DisplayName,
                PhotoUrl = user.PhotoUrl,
                EmailVerified = user.EmailVerified
            };

            _logger.LogInformation("User {Email} logged in successfully", user.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogWarning("Login failed: {Message}", ex.Message);
            return Unauthorized(new { message = "Invalid token" });
        }
    }

    [Authorize]
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var picture = User.FindFirst("picture")?.Value;
        var emailVerified = User.FindFirst("email_verified")?.Value;

        var profile = new UserProfile
        {
            Uid = userId,
            Email = email,
            DisplayName = name,
            PhotoUrl = picture,
            EmailVerified = bool.TryParse(emailVerified, out var verified) && verified
        };

        return Ok(profile);
    }

    [Authorize]
    [HttpGet("verify")]
    public IActionResult VerifyToken()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(new { message = "Token is valid", userId });
    }
}

public class LoginRequest
{
    public string IdToken { get; set; } = string.Empty;
}

public class LoginResponse
{
    public string Uid { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? PhotoUrl { get; set; }
    public bool EmailVerified { get; set; }
}

public class UserProfile
{
    public string Uid { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? PhotoUrl { get; set; }
    public bool EmailVerified { get; set; }
} 