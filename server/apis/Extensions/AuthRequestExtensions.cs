using apis.Requests;
using CommunityToolkit.Diagnostics;

namespace apis.Extensions;

public static class AuthRequestExtensions
{
    public static void Validate(this SignUpRequest request)
    {
        Guard.IsNotNull(request);
        Guard.IsNotNullOrEmpty(request.IdToken, nameof(request.IdToken));
        Guard.IsNotNullOrEmpty(request.Email, nameof(request.Email));
        Guard.IsNotNullOrEmpty(request.Name, nameof(request.Name));
    }
}
