# Utilities Architecture Documentation

## Overview

This document defines what qualifies as a **utility** in the Guras backend architecture. Utilities are cross-cutting infrastructure projects that provide reusable functionality to services, orchestration, and the API composition layer.

## What is a Utility?

A **utility** is a cross-cutting infrastructure project that provides reusable functionality to multiple services and orchestration projects. Utilities are tools that support business operations but do not own business domains.

### Key Characteristics

- **Cross-cutting concerns** - Functionality used across multiple services
- **Infrastructure focus** - Provides technical capabilities, not business logic
- **Reusable tools** - Designed to be used by services as dependencies
- **No domain ownership** - Does not own a business domain or data model
- **No direct client access** - Typically not exposed directly via HTTP endpoints (exceptions may exist for utility-specific endpoints)

## Common Patterns and Architecture

### 1. Project Structure

Utilities follow a flexible folder structure based on their purpose:

**Common Structure:**
```
utilities.[name]/
├── Configuration/          # Service registration extensions
├── Utilities/              # Utility classes and implementations (or Services/)
├── Domain/                 # Domain models (if applicable)
├── Controllers/            # API controllers (if exposing endpoints)
├── [UtilityName].csproj
```

### 2. Configuration Classes

Utilities provide extension methods for dependency injection registration:

**Pattern:**
```csharp
public static class [UtilityName]ServicesConfigurationExtensions
{
    public static IServiceCollection Add[UtilityName]Utilities(
        this IServiceCollection services, 
        IConfiguration? configuration = null)
    {
        // Register dependencies
        services.AddScoped<I[UtilityName]Service, [UtilityName]Service>();
        
        return services;
    }
}
```

### 3. Dependency Injection Patterns

**Service Registration:**
- Utilities registered with `AddScoped` or `AddSingleton` lifetime
- Interface-based design for testability
- Configuration-driven setup

**Example:**
```csharp
services.AddScoped<I[UtilityName]Service, [UtilityName]Service>();
services.AddScoped<IDbConnectionFactory, LocalDbConnectionFactory>();
```

### 4. Interface-Based Design

All utilities use interfaces for better testability and dependency injection:

- Define interfaces for all utility services
- Register interfaces with implementations
- Enable easy mocking and testing

### 5. Base Utilities Project

The base `utilities` project serves as the foundation:

- **BaseController** - All controllers extend this for consistent API responses
- **Database Abstractions** - Connection factories and persistence abstractions
- **API Response Models** - Standardized response format
- **Environment Detection** - Host environment utilities

Other utility projects typically reference `utilities` as a dependency.

### 6. Logging

**Consistent Pattern:**
- All utilities use `ILogger<T>` from `Microsoft.Extensions.Logging.Abstractions`
- Consistent logging patterns:
  - `_logger.LogInformation()` for operations
  - `_logger.LogError(ex, message)` for exceptions
  - `_logger.LogWarning()` for warnings

### 7. Project Configuration

**Common Properties:**
All utility projects use:
```xml
<TargetFramework>net8.0</TargetFramework>
<ImplicitUsings>enable</ImplicitUsings>
<Nullable>enable</Nullable>
```

**Common Dependencies:**
- `Microsoft.Extensions.Logging.Abstractions` (Version 8.0.2)
- `Microsoft.Extensions.DependencyInjection.Abstractions` (Version 8.0.2)
- `utilities` project reference (for specialized utilities)

## Utility Qualification Criteria

### ✅ Qualifies as a Utility When:

1. **Cross-Cutting Concern**
   - Functionality needed by multiple services
   - Provides infrastructure or technical capabilities
   - Not tied to a specific business domain

2. **Reusable Tool**
   - Designed to be used as a dependency by services
   - Provides interfaces for dependency injection
   - Stateless or manages its own state

3. **Infrastructure Focus**
   - Handles technical concerns (logging, caching, HTTP clients, cloud services)
   - Provides abstractions over external systems
   - Manages infrastructure resources

4. **No Domain Ownership**
   - Does not own a business domain
   - Does not have its own database context or entities
   - Does not contain business logic specific to a domain

5. **Optional API Endpoints**
   - May expose utility-specific endpoints (e.g., for testing or management)
   - Endpoints are for utility management, not business operations
   - Not the primary interface - services use utilities via dependency injection

### ❌ Does NOT Qualify as a Utility When:

1. **Business Domain Logic**
   - Contains business rules or domain models
   - Owns a business domain
   - Manages business-specific data

2. **Service Dependency**
   - Depends on specific services for its functionality
   - Tightly coupled to service implementations
   - Contains service-specific logic

3. **Orchestration Logic**
   - Coordinates multiple services
   - Implements workflows or business processes
   - Manages cross-service operations

## Utility Naming Convention

Utilities follow this naming pattern:

- **Project name**: `utilities.[name]`
- **Namespace**: `utilities.[name]`
- **Configuration class**: `[Name]ServicesConfiguration` or `[Name]ServicesConfigurationExtensions`
- **Configuration method**: `Add[Name]Utilities()` or `Add[Name]Services(IConfiguration)`

## Utility vs Service Distinction

| Aspect | Utility | Service |
|--------|---------|---------|
| **Domain Ownership** | No | Yes |
| **Business Logic** | No | Yes |
| **Data Model** | No | Yes (DbContext) |
| **API Endpoints** | Optional (utility management) | Yes (primary interface) |
| **Dependencies** | Used by services | Independent |
| **Purpose** | Cross-cutting infrastructure | Business domain |
| **Examples** | Logging, caching, HTTP clients, cloud services | Domain-specific business logic |

## Architecture Strengths

1. **Clear Separation of Concerns** - Utilities handle infrastructure, services handle business logic
2. **Reusability** - Utilities can be used by multiple services
3. **Testability** - Interface-based design enables easy testing
4. **Dependency Injection** - Consistent use of DI throughout
5. **Logging** - Comprehensive logging across all utilities
6. **Configuration Extensions** - Clean extension method pattern for registration

## Usage Patterns

### Services Using Utilities

Services depend on utilities as tools via dependency injection:

```csharp
// Service uses utility via interface
public class [ServiceName]Service
{
    private readonly I[UtilityName]Service _utilityService;
    
    public [ServiceName]Service(I[UtilityName]Service utilityService)
    {
        _utilityService = utilityService;
    }
}
```

### Composition in APIs Project

The `apis` project registers utilities:

```csharp
// In Program.cs or ApisServiceConfiguration.cs
services.Add[UtilityName]Utilities(configuration);
```

## Best Practices

1. **Keep Utilities Stateless** - Utilities should be stateless or manage their own state
2. **Use Interfaces** - Always provide interfaces for utility services
3. **Configuration-Driven** - Use `IConfiguration` for settings and connection strings
4. **Error Handling** - Provide comprehensive error handling and logging
5. **Dependency Injection** - Register all dependencies via extension methods
6. **Documentation** - Document utility interfaces and usage patterns

## Summary

**Utilities** are cross-cutting infrastructure projects that:

1. **Provide reusable infrastructure functionality** to services
2. **Use interface-based design** for testability and dependency injection
3. **Have configuration extensions** for easy registration
4. **Support multiple services** without coupling to specific domains
5. **Focus on technical concerns** rather than business logic
6. **Follow consistent patterns** for logging, configuration, and structure

Utilities enable services to focus on business logic while providing shared infrastructure capabilities. They are the foundation that supports the service-oriented architecture.

---

**Note**: For information about what qualifies as a service, see `services-architecture.md` in the services folder. For information about orchestration, see `orchestration-architecture.md` in the orchestration folder.
