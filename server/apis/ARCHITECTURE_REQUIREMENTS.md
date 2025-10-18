# API Architecture Requirements

## Project Structure

The Guras API project follows a specific architectural pattern for organization, naming, and validation. This document outlines the requirements for maintaining consistency across the codebase.

## Folder Organization

```
server/apis/
├── Controllers/          # Controller classes with business logic only
├── Requests/            # Individual request class files
├── Responses/           # Individual API response class files  
├── Models/              # Shared data models used across classes
├── Extensions/          # Validation extension methods
└── ARCHITECTURE_REQUIREMENTS.md
```

### Controllers/
- Contains only controller classes
- Focus on business logic and HTTP handling
- Must reference appropriate namespaces: `apis.Requests`, `apis.Responses`, `apis.Models`, `apis.Extensions`

### Requests/
- One class per file
- Naming pattern: `[Action]Request.cs`
- Examples: `SignUpRequest.cs`, `UploadAudioRequest.cs`, `UpdateUserPreferencesRequest.cs`

### Responses/
- One class per file
- Naming pattern: `[Action]Response.cs`
- Only for direct API response objects
- Examples: `SignUpResponse.cs`, `AudioFilesResponse.cs`, `UserProfileResponse.cs`

### Models/
- Shared data models used across multiple classes
- Simple naming without "Request" or "Response" suffix
- Examples: `UserInfo.cs`, `QuoteData.cs`

### Extensions/
- Validation extension methods using CommunityToolkit.Diagnostics Guard API
- Naming pattern: `[RequestType]Extensions.cs`
- Examples: `AuthRequestExtensions.cs`, `UploadAudioRequestExtensions.cs`

## Naming Conventions

### Properties
- **MUST** use PascalCase in C# code
- **MUST** use JsonPropertyName attributes to maintain camelCase in API responses
- Examples: `UserId`, `DisplayName`, `IsNewUser`, `FirebaseUid`

### Classes
- **Request classes**: `[Action]Request` (e.g., `SignUpRequest`, `UpdateUserPreferencesRequest`)
- **Response classes**: `[Action]Response` (e.g., `SignUpResponse`, `UserProfileResponse`)
- **Model classes**: Simple names (e.g., `UserInfo`, `QuoteData`)

### Files
- One class per file
- File name matches class name exactly

## Validation Requirements

### Guard API Usage
- **MUST** use `CommunityToolkit.Diagnostics` Guard API for validation
- **MUST** create extension methods for request validation
- **MUST** place validation as the first operation in controller methods (fail fast principle)

### Validation Pattern
```csharp
// In controller method
try
{
    request.Validate();
}
catch (ArgumentException ex)
{
    return BadRequest(new { Error = ex.Message });
}
```

### Extension Method Pattern
```csharp
public static void Validate(this [RequestType] request)
{
    Guard.IsNotNull(request);
    Guard.IsNotNullOrEmpty(request.Property, nameof(request.Property));
    // ... additional validation
}
```

### Null-Forgiving Operator
- Use `!` operator after validation to suppress compiler warnings
- Example: `request.AudioFile!.OpenReadStream()`

## File Structure Rules

### Response Objects
- **Responses folder**: Only for direct API response objects
- **Models folder**: For nested objects used within responses

### Examples
- ✅ `SignUpResponse` → `Responses/SignUpResponse.cs` (direct API response)
- ✅ `UserInfo` → `Models/UserInfo.cs` (nested object used in `LoginResponse`)

### Using Statements
Controllers must include:
```csharp
using apis.Requests;
using apis.Responses;
using apis.Models;
using apis.Extensions;
```

## Implementation Checklist

When creating new API endpoints:

- [ ] Create request class in `Requests/` folder
- [ ] Create response class in `Responses/` folder (if direct API response)
- [ ] Create validation extension in `Extensions/` folder
- [ ] Use PascalCase for all properties in C# code
- [ ] Add JsonPropertyName attributes for camelCase API responses
- [ ] Add validation as first operation in controller method
- [ ] Use Guard API for validation
- [ ] Add appropriate using statements to controller
- [ ] Use null-forgiving operator after validation

## Examples

### Request Class
```csharp
// Requests/SignUpRequest.cs
namespace apis.Requests;

public class SignUpRequest
{
    public string IdToken { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Name { get; set; }
}
```

### Response Class
```csharp
// Responses/SignUpResponse.cs
using System.Text.Json.Serialization;

namespace apis.Responses;

public class SignUpResponse
{
    [JsonPropertyName("uid")]
    public string Uid { get; set; } = string.Empty;
    
    [JsonPropertyName("email")]
    public string? Email { get; set; }
    
    [JsonPropertyName("displayName")]
    public string? DisplayName { get; set; }
    
    [JsonPropertyName("isNewUser")]
    public bool IsNewUser { get; set; }
    
    [JsonPropertyName("firebaseUid")]
    public string FirebaseUid { get; set; } = string.Empty;
}
```

### Validation Extension
```csharp
// Extensions/AuthRequestExtensions.cs
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
```

### Controller Usage
```csharp
// Controllers/AuthController.cs
using apis.Requests;
using apis.Responses;
using apis.Extensions;

[HttpPost("signup")]
public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
{
    try
    {
        // Validate first - fail fast
        try
        {
            request.Validate();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { Error = ex.Message });
        }

        // ... business logic
    }
    catch (Exception ex)
    {
        // ... error handling
    }
}
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained By**: Development Team
