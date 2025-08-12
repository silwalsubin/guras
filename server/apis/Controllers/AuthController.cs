using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using services.users.Services;
using services.users.Domain;
using Microsoft.Extensions.Logging;

namespace apis.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(ILogger<AuthController> logger, IUserAuthService userAuthService, UserService userService)
    : ControllerBase
{
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        try
        {
            // Verify Firebase ID token
            var firebaseToken = await userAuthService.VerifyIdTokenAsync(request.IdToken);
            
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
                uid = userId.ToString(),
                email = request.Email,
                displayName = request.Name,
                isNewUser = true,
                firebaseUid = firebaseToken.Uid
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

    [Authorize]
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var applicationUserId = User.FindFirst("application_user_id")?.Value;
        var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var email = User.FindFirst(ClaimTypes.Email)?.Value;
        var name = User.FindFirst(ClaimTypes.Name)?.Value;
        var picture = User.FindFirst("picture")?.Value;
        var emailVerified = User.FindFirst("email_verified")?.Value;

        var profile = new UserProfile
        {
            Uid = applicationUserId ?? firebaseUid ?? "", // Prefer application user ID, fallback to Firebase UID
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
        var applicationUserId = User.FindFirst("application_user_id")?.Value;
        var firebaseUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        return Ok(new { 
            message = "Token is valid", 
            applicationUserId = applicationUserId,
            firebaseUid = firebaseUid
        });
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
    public string uid { get; set; } = string.Empty;
    public string? email { get; set; }
    public string? displayName { get; set; }
    public bool isNewUser { get; set; }
    public string firebaseUid { get; set; } = string.Empty;
}

public class LoginResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public UserInfo User { get; set; } = new UserInfo();
}

public class UserProfile
{
    public string Uid { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? DisplayName { get; set; }
    public string? PhotoUrl { get; set; }
    public bool EmailVerified { get; set; }
}

public class UserInfo
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
    public string FirebaseUid { get; set; } = string.Empty;
} 