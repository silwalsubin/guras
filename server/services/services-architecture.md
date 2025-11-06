# Services Architecture Documentation

## Overview

This document defines what qualifies as a **service** in the Guras backend architecture. It provides clear criteria, patterns, and guidelines for creating new services. Services are the primary building blocks of the application, representing bounded contexts with clear domain ownership.

## What is a Service?

A **service** is a self-contained, domain-focused project that encapsulates a specific business capability or domain. Services are the primary building blocks of the application architecture and represent bounded contexts with clear responsibilities.

## Core Qualification Criteria

### 1. Domain Ownership

A service must own a distinct business domain or capability:

- **Has a clear, well-defined domain boundary**
  - The service is responsible for a specific area of business logic
  - The domain has clear entities, operations, and rules
  - The domain can be understood independently of other services

- **Owns its data model**
  - Has its own database context (DbContext) and entities
  - Manages its own data persistence lifecycle
  - Controls access to its domain data through repositories

- **Has independent business logic**
  - Contains domain-specific operations and rules
  - Can evolve its business logic without affecting other services
  - Has its own validation and business rules

### 2. API Surface Area

A service must expose HTTP endpoints via controllers:

- **Has one or more controllers**
  - Exposes RESTful API endpoints
  - Handles HTTP requests and responses
  - Provides API-level access to the service's functionality

- **Uses BaseController**
  - All controllers extend `BaseController` for consistent API responses
  - Provides standardized error handling and response formatting
  - Includes trace IDs for debugging

- **Has clear API contracts**
  - Defines request DTOs (in `Requests/` folder)
  - Defines response DTOs (in `Responses/` folder)
  - Documents its API surface area

### 3. Service Layer Architecture

A service must implement a layered architecture:

- **Service Layer** (`Services/` folder)
  - Contains business logic services
  - Implements service interfaces (`I[ServiceName]Service`)
  - Handles domain operations and orchestrates data access

- **Repository Layer** (`Repositories/` folder)
  - Abstracts data access through repository interfaces
  - Implements repository pattern with Entity Framework Core
  - Returns domain models, not entity models

- **Domain Models** (`Domain/` folder)
  - Clean domain models without database concerns
  - Represents business entities and value objects
  - Used by business logic layer

- **Entity Models** (`Models/` folder)
  - Entity Framework Core entities for database mapping
  - Separate from domain models
  - Handles database persistence concerns

### 4. Configuration and Dependency Injection

A service must provide its own configuration:

- **Configuration Extension** (`Configuration/` folder)
  - Implements `Add[ServiceName]Services()` extension method
  - Registers all service dependencies (repositories, services, DbContext)
  - Accepts `IConfiguration` for connection strings and settings
  - Returns `IServiceCollection` for fluent chaining

- **Dependency Injection**
  - All services registered with appropriate lifetimes (typically `AddScoped`)
  - Interfaces registered with implementations
  - Follows dependency inversion principle

### 5. Data Access Pattern

A service must use standardized data access:

- **Entity Framework Core**
  - Uses EF Core for all database operations
  - Has its own `DbContext` in `Data/` folder
  - Uses PostgreSQL via `Npgsql.EntityFrameworkCore.PostgreSQL`
  - Implements async/await for all database operations

- **Repository Pattern**
  - Repository interfaces and implementations in `Repositories/` folder
  - Repositories work with domain models, not entities
  - Mapping services convert between entities and domain models

### 6. Independence and Isolation

A service should be as independent as possible:

- **No direct service-to-service dependencies**
  - Does not directly reference other domain services
  - Does not depend on other services' implementation details
  - Can be developed, tested, and deployed independently

- **May depend on utilities**
  - Can use cross-cutting utilities (e.g., `utilities`, `utilities.aws`, `utilities.ai`)
  - Utilities are tools, not domain dependencies
  - Similar to how services use logging or caching

- **Composed by orchestration layer**
  - Services are composed by `apis` project (composition root)
  - Orchestration projects can depend on multiple services
  - Services don't know about orchestration

## Standard Folder Structure

All services must follow this standardized folder structure:

```
services.[domainname]/
├── Configuration/          # Service registration extensions
├── Controllers/           # API controllers (extend BaseController)
├── Services/              # Business logic services and interfaces
├── Repositories/          # Data access repositories and interfaces
├── Domain/                # Domain models (clean business logic)
├── Models/                # Entity models (EF Core) and DTOs
├── Data/                  # DbContext and database configuration
├── Requests/              # Request DTOs
├── Responses/             # Response DTOs
├── Extensions/            # Extension methods (optional)
└── [ServiceName].csproj
```

## Common Patterns and Architecture

### 1. Configuration Classes

All services use extension methods for dependency injection registration:

**Pattern:**
```csharp
public static class [ServiceName]ServicesConfigurationExtensions
{
    public static IServiceCollection Add[ServiceName]Services(
        this IServiceCollection services, 
        IConfiguration configuration,
        IDbConnectionFactory connectionFactory)
    {
        // Register DbContext
        services.AddDbContext<[ServiceName]DbContext>(options =>
        {
            options.UseNpgsql(connectionFactory.GetConnectionString());
        });

        // Register repositories
        services.AddScoped<I[Entity]Repository, [Entity]Repository>();

        // Register services
        services.AddScoped<I[ServiceName]Service, [ServiceName]Service>();

        return services;
    }
}
```

### 2. Dependency Injection Patterns

**Service Registration:**
- Services registered with `AddScoped` lifetime
- Repositories registered with `AddScoped` lifetime
- Interfaces registered with implementations

**Example:**
```csharp
services.AddScoped<I[Entity]Repository, [Entity]Repository>();
services.AddScoped<I[ServiceName]Service, [ServiceName]Service>();
```

### 3. Data Access Patterns

**Standardized Pattern: Entity Framework Core**

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

### 4. Controller Patterns

**Standardized Pattern: BaseController**

All controllers extend `BaseController` from utilities for standardized API responses.

**Benefits:**
- Consistent API response format across all endpoints
- Standardized error handling with proper HTTP status codes
- Built-in validation error responses
- Trace ID included in all responses for debugging

### 5. Service Layer Patterns

**Interface-Based Services:**
All services use interfaces:
- Interface files: `I[ServiceName]Service.cs` in `Services/` folder
- Implementation files: `[ServiceName]Service.cs` in `Services/` folder
- Both in the same namespace for consistency
- All services follow the interface-based design pattern for better testability and dependency injection

### 6. Logging

**Consistent Pattern:**
- All services use `ILogger<T>` from `Microsoft.Extensions.Logging.Abstractions`
- Consistent logging patterns:
  - `_logger.LogInformation()` for operations
  - `_logger.LogError(ex, message)` for exceptions
  - `_logger.LogWarning()` for warnings

### 7. Project Configuration

**Common Properties:**
All service projects use:
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
- `Microsoft.EntityFrameworkCore` (Version 8.0.0)
- `Microsoft.EntityFrameworkCore.Design` (Version 8.0.0)
- `Npgsql.EntityFrameworkCore.PostgreSQL` (Version 8.0.0)
- `utilities` project reference - all service projects

## Service Naming Convention

Services follow this naming pattern:

- **Project name**: `services.[domainname]`
- **Namespace**: `services.[domainname]`
- **Configuration class**: `[Domain]ServicesConfigurationExtensions`
- **Configuration method**: `Add[Domain]Services(IConfiguration)`

## Decision Framework

When deciding whether to create a new service, use this framework:

### ✅ Create a New Service When:

1. **New Domain Capability**
   - Represents a distinct business domain not covered by existing services
   - Has its own data model and business rules
   - Requires independent API endpoints

2. **Clear Boundaries**
   - Domain can be clearly separated from other services
   - Data ownership is clear and independent
   - Business logic can evolve independently

3. **Sufficient Complexity**
   - Has enough functionality to warrant a separate project
   - Will have multiple operations, entities, or endpoints
   - Benefits from its own repository and service layers

4. **Independent Evolution**
   - Needs to evolve separately from other services
   - May have different deployment or scaling requirements
   - Has distinct lifecycle or release cadence

### ❌ Do NOT Create a New Service When:

1. **Simple CRUD Operations**
   - Can be added to an existing service that owns the domain
   - Is a natural extension of existing functionality
   - Doesn't require separate data model

2. **Utility Functionality**
   - Is a cross-cutting concern (logging, caching, HTTP clients)
   - Will be used by multiple services
   - Has no domain ownership

3. **Feature Extension**
   - Extends functionality of an existing service
   - Shares the same domain and data model
   - Can be added as new endpoints to existing service

4. **Tight Coupling**
   - Requires frequent coordination with another service
   - Shares data model or business logic with another service
   - Would create circular dependencies

## Service Characteristics Checklist

A qualified service should meet all of these characteristics:

- [ ] Has a clear, well-defined domain boundary
- [ ] Owns its data model (has its own DbContext)
- [ ] Exposes HTTP endpoints via controllers
- [ ] Uses BaseController for consistent API responses
- [ ] Implements service layer with interfaces
- [ ] Implements repository layer for data access
- [ ] Has domain models separate from entity models
- [ ] Uses Entity Framework Core for data access
- [ ] Provides configuration extension method
- [ ] Registers dependencies via dependency injection
- [ ] Uses logging via ILogger
- [ ] Follows async/await patterns
- [ ] Has request/response DTOs
- [ ] No direct dependencies on other domain services
- [ ] Can be tested independently
- [ ] Follows standardized folder structure

## Summary

A **service** is a self-contained, domain-focused project that:

1. **Owns a distinct business domain** with clear boundaries
2. **Exposes HTTP API endpoints** for client access
3. **Implements layered architecture** (controllers, services, repositories, domain)
4. **Uses Entity Framework Core** for data access
5. **Provides configuration** for dependency injection
6. **Remains independent** from other domain services
7. **Follows standardized patterns** and folder structure

Services are the primary building blocks of the application, representing bounded contexts with clear responsibilities. They enable independent development, testing, and evolution of business capabilities.

---

**Note**: For information about utilities, see `utilities-architecture.md` in the utilities folder. For information about orchestration, see `orchestration-architecture.md` in the orchestration folder.
