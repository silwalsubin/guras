using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Security.Claims;
using services.users.Services;
using services.users.Domain;
using services.users.Requests;
using services.users.Responses;
using services.users.Extensions;
using utilities.Controllers;

namespace services.users.Controllers;

[Route("api/[controller]")]
public class AuthController(ILogger<AuthController> logger, IUserAuthService userAuthService, UserService userService)
    : BaseController
{
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        // Validation is now handled by ValidationActionFilter
        logger.LogBusinessOperation("User signup attempt", null, new { Email = request.Email });

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

        logger.LogBusinessOperation("User signup successful", userId.ToString(), new { Email = request.Email });

        var response = new SignUpResponse
        {
            Uid = userId.ToString(),
            Email = request.Email,
            DisplayName = request.Name,
            IsNewUser = true,
            FirebaseUid = firebaseToken.Uid
        };

        return SuccessResponse(response);
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
