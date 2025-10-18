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
├── Extensions/          # Validation extension methods and logging extensions
├── Middleware/          # Global middleware for exception handling and logging
├── Filters/             # Action filters for cross-cutting concerns
└── ARCHITECTURE_REQUIREMENTS.md
```

### Controllers/
- Contains only controller classes
- **MUST** inherit from `BaseController` for standardized responses
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
- Logging extension methods for structured logging
- Naming pattern: `[RequestType]Extensions.cs` or `LoggingExtensions.cs`
- Examples: `AuthRequestExtensions.cs`, `UploadAudioRequestExtensions.cs`, `LoggingExtensions.cs`

### Middleware/
- Global exception handling middleware
- Request logging middleware with correlation IDs
- Performance monitoring middleware
- Examples: `GlobalExceptionHandlingMiddleware.cs`, `RequestLoggingMiddleware.cs`

### Filters/
- Action filters for cross-cutting concerns
- Validation filters (replaces manual validation in controllers)
- Logging filters for business operations
- Swagger operation filters for API documentation
- Examples: `ValidationActionFilter.cs`, `LoggingActionFilter.cs`, `SwaggerOperationFilter.cs`

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

## Enhanced Architecture Patterns

### Global Exception Handling
- **MUST** use `GlobalExceptionHandlingMiddleware` for centralized error handling
- **MUST NOT** use try-catch blocks in controllers for generic exceptions
- **MUST** let exceptions bubble up to middleware for consistent error responses
- **MUST** use specific exception types for different error scenarios

### Standardized Response Format
- **MUST** use `ApiResponse<T>` wrapper for all API responses
- **MUST** inherit from `BaseController` for standardized response methods
- **MUST** include correlation IDs in all responses
- **MUST** use `SuccessResponse()` and `ErrorResponse()` methods

### Enhanced Logging
- **MUST** use structured logging with correlation IDs
- **MUST** use `LoggingExtensions` for consistent log formatting
- **MUST** log business operations, security events, and performance warnings
- **MUST** include user context in log messages when available

### Action Filters
- **MUST** use `ValidationActionFilter` for automatic request validation
- **MUST** use `LoggingActionFilter` for business operation logging
- **MUST NOT** manually validate requests in controller methods
- **MUST NOT** manually log basic request/response information

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
- [ ] Inherit from `BaseController` for standardized responses
- [ ] Use `SuccessResponse()` and `ErrorResponse()` methods
- [ ] Use `LoggingExtensions` for business operation logging
- [ ] Let exceptions bubble up to global exception handler
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

[Route("api/[controller]")]
public class AuthController : BaseController
{
    [HttpPost("signup")]
    public async Task<IActionResult> SignUp([FromBody] SignUpRequest request)
    {
        // Validation is now handled by ValidationActionFilter
        logger.LogBusinessOperation("User signup attempt", null, new { Email = request.Email });

        // ... business logic
        
        var response = new SignUpResponse { /* ... */ };
        return SuccessResponse(response);
    }
}
```

---

**Last Updated**: December 2024  
**Version**: 1.0  
**Maintained By**: Development Team
