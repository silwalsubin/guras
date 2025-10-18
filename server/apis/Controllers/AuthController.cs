using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using services.users.Services;
using services.users.Domain;
using Microsoft.Extensions.Logging;
using apis.Requests;
using apis.Responses;
using apis.Extensions;

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
            // Validate the request first - fail fast if invalid
            try
            {
                request.Validate();
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Error = ex.Message });
            }

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
                Uid = userId.ToString(),
                Email = request.Email,
                DisplayName = request.Name,
                IsNewUser = true,
                FirebaseUid = firebaseToken.Uid
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

        var profile = new UserProfileResponse
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
        return Ok(new TokenVerificationResponse
        { 
            Message = "Token is valid", 
            ApplicationUserId = applicationUserId,
            FirebaseUid = firebaseUid
        });
    }
}
