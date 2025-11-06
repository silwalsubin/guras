# Services Project Architecture Documentation

## Overview

This document analyzes the architecture, common patterns, and inconsistencies across all service projects in the Guras backend. The system follows a microservices-oriented architecture with multiple service projects that are composed into a single API application.

## Service Projects Inventory

### Core Services
1. **services.users** - User management and authentication
2. **services.teachers** - Teacher/spiritual guide management
3. **services.audio** - Audio file management
4. **services.journal** - Journal entry management
5. **services.meditation** - Meditation analytics and tracking
6. **services.notifications** - Notification management
7. **services.quotes** - Quote service
8. **services.ai** - AI services (spiritual teacher AI, meditation recommendations)

### Infrastructure Projects
9. **utilities** - Shared utilities and persistence abstractions
10. **utilities.aws** - AWS-specific utilities (S3, Secrets Manager)
11. **orchestration.backgroundServices** - Background services (notification scheduler)
12. **apis** - Main API project that composes all services
13. **tests** - Test project

## Common Patterns and Architecture

### 1. Project Structure

Most services follow a consistent folder structure:

```
[ServiceName]/
├── Configuration/          # Service registration extensions
├── Controllers/           # API controllers
├── Services/              # Business logic services
├── Repositories/          # Data access layer
├── Domain/                # Domain models (clean business logic models)
├── Models/                # Entity models (EF Core) and request/response DTOs
├── Requests/              # Request DTOs
├── Responses/             # Response DTOs
├── Extensions/            # Extension methods (some services)
└── [ServiceName].csproj
```

**Services using this pattern:**
- services.users (has `Data/` and `Repositories/` for EF Core)
- services.teachers (has `Data/` and `Migrations/` for EF Core)
- services.audio
- services.journal
- services.meditation
- services.notifications
- services.quotes

**Services with variations:**
- services.ai - No repository layer, uses HTTP clients

### 2. Configuration Classes

All services use extension methods for dependency injection registration:

**Pattern:**
```csharp
public static class [ServiceName]ServicesConfiguration[Extensions]
{
    public static IServiceCollection Add[ServiceName]Services(this IServiceCollection services[, IConfiguration configuration])
    {
        // Register dependencies
        return services;
    }
}
```

**Examples:**
- `services.users.Configuration.UserServicesConfigurationExtensions.AddUserServices(IConfiguration)`
- `services.teachers.Configuration.TeachersServicesConfigurationExtensions.AddTeachersServices(IConfiguration)`
- `services.ai.Configuration.AIServicesConfigurationExtensions.AddAIServices(IConfiguration)`
- `services.audio.Configuration.AudioServicesConfigurationExtensions.AddAudioServices(IConfiguration)`
- `services.journal.Configuration.JournalServicesConfigurationExtensions.AddJournalServices(IConfiguration)`
- `services.meditation.Configuration.MeditationServicesConfigurationExtensions.AddMeditationServices(IConfiguration)`
- `services.notifications.Configuration.NotificationsServicesConfigurationExtensions.AddNotificationsServices(IConfiguration)`
- `services.quotes.Configuration.QuotesServicesConfigurationExtensions.AddQuotesServices(IConfiguration)`

### 3. Dependency Injection Patterns

**Service Registration:**
- Services registered with `AddScoped` lifetime
- Repositories registered with `AddScoped` lifetime
- Interfaces registered with implementations

**Example:**
```csharp
services.AddScoped<IUserRepository, UserRepository>();
services.AddScoped<UserService>();
services.AddScoped<ISpiritualAIService, SpiritualAIService>();
```

### 4. Data Access Patterns

**Standardized Pattern: Entity Framework Core**

All services now use Entity Framework Core (EF Core) for data access, following a consistent pattern:

**Structure:**
- **DbContext**: `[ServiceName]DbContext` in `Data/` folder
  - Configured with PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL`
  - Connection string from `IConfiguration`
- **Entity Models**: `[Entity]Entity.cs` in `Models/` folder
  - Database table mappings
  - Used by EF Core for database operations
- **Domain Models**: `[Entity].cs` in `Domain/` folder
  - Clean domain models without database concerns
  - Used by business logic layer
- **Mapping Services**: `[Entity]MappingService.cs` in `Services/` folder
  - Converts between Entity models and Domain models
  - Extension methods: `ToDomain()`, `ToEntity()`
- **Repository Pattern**: `I[Entity]Repository` and `[Entity]Repository`
  - Repository interface and implementation
  - Uses `DbContext` for data access
  - Returns Domain models, not Entity models
  - Asynchronous operations with `async/await`

**Services using EF Core:**
- services.users
- services.teachers
- services.audio
- services.journal
- services.meditation
- services.notifications
- services.quotes

**Benefits:**
- Type-safe LINQ queries
- Built-in migration support
- Change tracking
- Consistent data access pattern across all services
- Better integration with .NET ecosystem

### 5. Controller Patterns

**Standardized Pattern: BaseController**

All controllers extend `BaseController` from utilities for standardized API responses:
- services.users.Controllers.AuthController
- services.teachers.Controllers.TeachersController
- services.audio.Controllers.AudioController
- services.journal.Controllers.JournalController
- services.meditation.Controllers.MeditationAnalyticsController
- services.notifications.Controllers.NotificationController
- services.quotes.Controllers.QuotesController
- services.ai.Controllers.SpiritualAIController
- services.ai.Controllers.MeditationRecommendationController
- apis.Controllers.UserNotificationPreferencesController
- apis.Controllers.HeartBeatController

**Benefits:**
- Consistent API response format across all endpoints
- Standardized error handling with proper HTTP status codes
- Built-in validation error responses
- Trace ID included in all responses for debugging

### 6. Service Layer Patterns

**Interface-Based Services:**
All services now use interfaces:
- `IUserAuthService`, `IUserRepository`, `IUserService`
- `ITeacherService`, `ITeacherRepository`
- `IAudioFileService`, `IAudioFileRepository`
- `IJournalEntryService`, `IJournalEntryRepository`
- `IMeditationAnalyticsService` (interface in separate file)
- `ISpiritualAIService`, `IMeditationRecommendationService`
- `INotificationTokenService`, `IUserNotificationPreferencesService`
- `IQuotesService`

**Note:** All services follow the interface-based design pattern for better testability and dependency injection.

### 7. Logging

**Consistent Pattern:**
- All services use `ILogger<T>` from `Microsoft.Extensions.Logging.Abstractions`
- Consistent logging patterns:
  - `_logger.LogInformation()` for operations
  - `_logger.LogError(ex, message)` for exceptions
  - `_logger.LogWarning()` for warnings

### 8. Project Configuration

**Common Properties:**
All projects use:
```xml
<TargetFramework>net8.0</TargetFramework>
<ImplicitUsings>enable</ImplicitUsings>
<Nullable>enable</Nullable>
```

**Common Dependencies:**
- `Microsoft.Extensions.Logging.Abstractions` (Version 8.0.2)
- `Microsoft.Extensions.DependencyInjection.Abstractions` (Version 8.0.2)
- `Microsoft.AspNetCore.Mvc.Core` (Version 2.2.5)
- `Microsoft.AspNetCore.Authorization` (Version 8.0.0) - most services
- `utilities` project reference - all service projects

## Inconsistencies and Issues

### 1. Controller Base Class Usage

**Status:** ✅ **RESOLVED** - All controllers now extend `BaseController`.

**Current State:**
All controllers extend `BaseController` for consistent API response formatting:
- Standardized success responses with `SuccessResponse()` method
- Standardized error responses with `ErrorResponse()`, `NotFoundResponse()`, `UnauthorizedResponse()` methods
- Validation error responses with `ValidationErrorResponse()` method
- All responses include trace ID for debugging

**Note:** Converted all controllers that previously extended `ControllerBase` directly to use `BaseController` for consistency across the entire API.

### 2. Service Interface Definitions

**Status:** ✅ **RESOLVED** - All services now have interfaces and follow consistent patterns.

**Current State:**
- `IUserService` interface created for `UserService`
- `IMeditationAnalyticsService` interface moved to separate file
- All service interfaces are in separate files from their implementations
- All services registered with their interfaces in dependency injection

**Structure:**
- Interface files: `I[ServiceName].cs` in `Services/` folder
- Implementation files: `[ServiceName].cs` in `Services/` folder
- Both in the same namespace for consistency

### 3. Project Dependencies

**Issue:** Some services have missing or inconsistent dependencies.

**Observations:**
- `services.meditation` doesn't have `Microsoft.Extensions.DependencyInjection.Abstractions` but uses DI
- `services.quotes` doesn't have `Microsoft.Extensions.DependencyInjection.Abstractions`
- Some services reference `Microsoft.AspNetCore.Mvc.Core` 2.2.5 (old version)

**Recommendation:** Ensure all projects have consistent dependency versions and include required packages.

### 4. Service-to-Service Dependencies

**Issue:** Some services have direct project references to other services.

**Current State:**
- services.ai references services.meditation
- services.journal references services.ai
- services.notifications references services.quotes
- orchestration.backgroundServices references services.quotes and services.notifications

**Recommendation:** Document these dependencies and consider if they should be abstracted through interfaces or events.

## Service-Specific Observations

### services.users
- Uses `Repositories/` folder (standardized from `Persistence/`)
- Has two separate configuration classes (`UserServicesConfigurationExtensions` and `AuthenticationServicesConfigurationExtensions`)
- `IUserService` interface created and registered in dependency injection
- Uses Entity Framework Core with `UsersDbContext`
- Domain model: `User` (replaced `UserRecord`)
- Entity model: `UserEntity` for database mapping

### services.teachers
- Reference implementation for EF Core pattern
- Has `Data/` folder with `TeachersDbContext`
- Has `Migrations/` folder
- Uses Entity-to-Domain mapping pattern
- All other services follow this pattern

### services.audio
- Has both `Domain/` and `Models/` folders
  - `Domain/`: `AudioFile` domain model
  - `Models/`: `AudioFileEntity` (EF Core entity) and DTOs (CreateAudioFileRequest, AudioFileResponse, etc.)
- Has both repository and service layers
- Uses Entity Framework Core with `AudioFilesDbContext`
- Integrates with AWS S3 for file storage

### services.journal
- Standard repository pattern with Entity Framework Core
- Uses `JournalEntriesDbContext`
- Has AI integration (references services.ai)
- Well-structured with clear separation of concerns

### services.meditation
- Standard repository pattern with Entity Framework Core
- Uses `MeditationAnalyticsDbContext`
- `IMeditationAnalyticsService` interface in separate file
- Domain models in `Domain/MeditationAnalytics.cs`

### services.notifications
- Standard repository pattern with Entity Framework Core
- Uses `NotificationsDbContext` for both notification tokens and user preferences
- References services.quotes
- Firebase integration for push notifications
- Both `INotificationTokenRepository` and `IUserNotificationPreferencesRepository` implemented

### services.quotes
- Entity Framework Core with `QuotesDbContext`
- Uses repository pattern with `IQuoteRepository`
- Database-backed with initial seed data
- All service methods are now asynchronous

### services.ai
- Uses HTTP clients for external API calls
- Complex configuration with multiple HTTP clients
- References services.meditation
- Has configuration class separate from extensions

### orchestration.backgroundServices
- Background service pattern
- References services.quotes and services.notifications
- Uses Firebase for notifications

## Recommendations Summary

### ✅ Completed
1. **✅ Standardized Data Access:** All services now use Entity Framework Core
2. **✅ Standardized Configuration Parameters:** All service configuration methods accept `IConfiguration`
3. **✅ Standardized Repository Pattern:** All services with database access use repository pattern
4. **✅ Removed Dapper:** Dapper has been removed from all service projects
5. **✅ Standardized EF Core Packages:** All services use consistent EF Core package versions (8.0.0)
6. **✅ Standardized Configuration Naming:** All configuration classes now use `[Service]ServicesConfigurationExtensions` pattern
7. **✅ Standardized Method Naming:** All services use `Add[Service]Services()` pattern
8. **✅ Standardized Folder Names:** All services use `Repositories/` and `Domain/` consistently

### Remaining Recommendations
1. **✅ Standardize Controller Base:** All controllers now use `BaseController` consistently
2. **✅ Add Missing Interfaces:** All services now have interfaces
   - `IUserService` interface created for `UserService`
3. **✅ Split Interface Files:** All service interfaces are in separate files
   - `IMeditationAnalyticsService` moved to separate file
4. **Document Dependencies:** Document service-to-service dependencies
5. **Update Package Versions:** Ensure all projects use consistent, up-to-date package versions

## Architecture Strengths

1. **Clear Separation of Concerns:** Services are well-separated by domain
2. **Dependency Injection:** Consistent use of DI throughout
3. **Logging:** Comprehensive logging across all services
4. **Interface-Based Design:** Most services use interfaces for testability
5. **Project Isolation:** Services are in separate projects, enabling independent deployment
6. **Configuration Extensions:** Clean extension method pattern for service registration
7. **Request/Response DTOs:** Clear separation of API contracts

## Conclusion

The services architecture has been significantly improved with the standardization of Entity Framework Core across all services. This provides:

**Key Achievements:**
- ✅ Consistent data access pattern across all services
- ✅ Type-safe LINQ queries throughout
- ✅ Built-in migration support
- ✅ Better integration with .NET ecosystem
- ✅ Standardized repository pattern
- ✅ All services use async/await for database operations

**Remaining Areas for Improvement:**
- Documenting service-to-service dependencies
- Ensuring consistent package versions across projects

The architecture is now more maintainable and follows consistent patterns across all services, making it easier for developers to understand and contribute to the codebase.

