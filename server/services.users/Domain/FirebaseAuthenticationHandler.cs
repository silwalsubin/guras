using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using services.users.Services;

namespace services.users.Domain;

public class FirebaseAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory loggerFactory,
    UrlEncoder encoder,
    ISystemClock clock,
    IUserAuthService userAuthService,
    UserService userService)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, loggerFactory, encoder, clock)
{
    private readonly ILogger<FirebaseAuthenticationHandler> _logger = loggerFactory.CreateLogger<FirebaseAuthenticationHandler>();

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.ContainsKey("Authorization"))
        {
            return AuthenticateResult.Fail("Authorization header not found.");
        }

        var authorizationHeader = Request.Headers["Authorization"].ToString();
        if (!authorizationHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
        {
            return AuthenticateResult.Fail("Bearer token not found.");
        }

        var token = authorizationHeader.Substring("Bearer ".Length).Trim();

        try
        {
            var firebaseToken = await userAuthService.VerifyIdTokenAsync(token);
            
            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, firebaseToken.Uid),
                new Claim(ClaimTypes.Email, firebaseToken.Claims["email"]?.ToString() ?? ""),
                new Claim("firebase_uid", firebaseToken.Uid),
                new Claim("email_verified", firebaseToken.Claims["email_verified"]?.ToString() ?? "false")
            };

            // Add custom claims if they exist
            if (firebaseToken.Claims.ContainsKey("name"))
            {
                claims.Add(new Claim(ClaimTypes.Name, firebaseToken.Claims["name"]?.ToString() ?? ""));
            }

            if (firebaseToken.Claims.ContainsKey("picture"))
            {
                claims.Add(new Claim("picture", firebaseToken.Claims["picture"]?.ToString() ?? ""));
            }

            // Try to get the application user ID from the database
            try
            {
                var dbUser = await userService.GetUserByFireBaseUserIdAsync(firebaseToken.Uid);
                if (dbUser != null)
                {
                    // Add application user ID to claims
                    claims.Add(new Claim("application_user_id", dbUser.UserId.ToString()));
                    claims.Add(new Claim("application_email", dbUser.Email ?? ""));
                    claims.Add(new Claim("application_name", dbUser.Name ?? ""));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning("Could not fetch application user data: {Message}", ex.Message);
            }

            var identity = new ClaimsIdentity(claims, Scheme.Name);
            var principal = new ClaimsPrincipal(identity);
            var ticket = new AuthenticationTicket(principal, Scheme.Name);

            return AuthenticateResult.Success(ticket);
        }
        catch (Exception ex)
        {
            return AuthenticateResult.Fail($"Invalid token: {ex.Message}");
        }
    }
} 