using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using services.authentication;
using services.authentication.Services;
using services.Services;
using services.Domain;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ILogger<AuthController> logger, IAuthenticationService authenticationService, UserService userService)
    : ControllerBase
{
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        try
        {
            // Verify Firebase ID token
            var firebaseToken = await authenticationService.VerifyIdTokenAsync(request.IdToken);
            
            // Create payload for user service
            var createUserPayload = new CreateNewUserPayload
            {
                Email = request.Email,
                Name = request.Name,
                FireBaseUserId = firebaseToken.Uid
            };
            
            // Create user using the service
            var userId = await userService.CreateUserAsync(createUserPayload);
            
            logger.LogInformation("User {Email} signed up successfully with ID {UserId}", request.Email, userId);
            
            var response = new SignUpResponse
            {
                Uid = userId.ToString(),
                Email = request.Email,
                DisplayName = request.Name,
                IsNewUser = true
            };
            
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            // Business logic error (e.g., user already exists)
            logger.LogWarning("Signup failed for {Email}: {Message}", request.Email, ex.Message);
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            logger.LogWarning("Signup failed for {Email}: {Message}", request.Email, ex.Message);
            return BadRequest(new { message = "Signup failed", error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest request)
    {
        try
        {
            var firebaseToken = await authenticationService.VerifyIdTokenAsync(request.IdToken);
            
            // Try to get user from our database first
            var dbUser = await userService.GetUserByFireBaseUserIdAsync(firebaseToken.Uid);
            
            if (dbUser == null)
            {
                // User doesn't exist in our database
                logger.LogWarning("Login failed for Firebase UID {FirebaseUid}: User not found in database", firebaseToken.Uid);
                return Unauthorized(new { message = "User not found in database. Please sign up first." });
            }
            
            // Get additional Firebase user info
            var firebaseUser = await authenticationService.GetUserAsync(firebaseToken.Uid);

            var response = new LoginResponse
            {
                Uid = dbUser.UserId.ToString(),
                Email = dbUser.Email,
                DisplayName = dbUser.Name,
                PhotoUrl = firebaseUser?.PhotoUrl,
                EmailVerified = firebaseUser?.EmailVerified ?? false
            };

            logger.LogInformation("User {Email} logged in successfully", dbUser.Email);
            return Ok(response);
        }
        catch (Exception ex)
        {
            logger.LogWarning("Login failed: {Message}", ex.Message);
            return Unauthorized(new { message = "Login failed", error = ex.Message });
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

public class SignUpRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
}

public class SignUpResponse
{
    public string Uid { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public bool IsNewUser { get; set; }
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