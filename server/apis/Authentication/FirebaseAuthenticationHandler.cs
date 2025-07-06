using System.Security.Claims;
using System.Text.Encodings.Web;
using FirebaseAdmin.Auth;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace apis.Authentication;

public class FirebaseAuthenticationHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    private readonly IFirebaseService _firebaseService;

    public FirebaseAuthenticationHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ISystemClock clock,
        IFirebaseService firebaseService)
        : base(options, logger, encoder, clock)
    {
        _firebaseService = firebaseService;
    }

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
            var firebaseToken = await _firebaseService.VerifyIdTokenAsync(token);
            
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
                claims.Add(new Claim(ClaimTypes.Name, firebaseToken.Claims["name"].ToString()));
            }

            if (firebaseToken.Claims.ContainsKey("picture"))
            {
                claims.Add(new Claim("picture", firebaseToken.Claims["picture"].ToString()));
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