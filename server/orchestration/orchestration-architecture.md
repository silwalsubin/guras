# Orchestration Architecture Documentation

## Overview

This document defines what qualifies as **orchestration** in the Guras backend architecture. Orchestration projects coordinate and compose multiple services to implement workflows, background processes, and cross-service operations.

## What is Orchestration?

An **orchestration project** coordinates multiple services to implement workflows, background processes, and cross-service operations. Orchestration projects act as composition layers that bring together multiple services to achieve higher-level functionality.

### Key Characteristics

- **Workflow coordination** - Coordinates operations across multiple services
- **Background processes** - Implements long-running background tasks
- **Service composition** - Combines multiple services to achieve workflows
- **No domain ownership** - Does not own a business domain or data model
- **Cross-service operations** - Implements processes that span multiple service boundaries
- **Background services** - Runs as background services using `IHostedService` or `BackgroundService`

## Common Patterns and Architecture

### 1. Project Structure

Orchestration projects follow a flexible structure based on their purpose:

**Common Structure:**
```
orchestration.[name]/
├── BackgroundServices/     # Background service implementations
├── Workflows/              # Workflow orchestration (if applicable)
├── Configuration/          # Service registration extensions (if applicable)
├── [OrchestrationName].csproj
```

### 2. Background Service Pattern

Orchestration projects typically implement background services:

**Pattern:**
```csharp
public class [Name]BackgroundService : BackgroundService
{
    private readonly ILogger<[Name]BackgroundService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    public [Name]BackgroundService(
        ILogger<[Name]BackgroundService> logger,
        IServiceScopeFactory scopeFactory)
    {
        _logger = logger;
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("[Name] Background Service started");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PerformWork();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background service loop");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }

        _logger.LogInformation("[Name] Background Service stopped");
    }

    private async Task PerformWork()
    {
        using (var scope = _scopeFactory.CreateScope())
        {
            var service1 = scope.ServiceProvider.GetRequiredService<IService1>();
            var service2 = scope.ServiceProvider.GetRequiredService<IService2>();
            
            // Orchestrate workflow across services
        }
    }
}
```

**Key Features:**
- Extends `BackgroundService` or implements `IHostedService`
- Uses `IServiceScopeFactory` to create scoped services
- Implements periodic or continuous background tasks
- Handles errors gracefully with logging

### 3. Service Scope Management

Orchestration projects use `IServiceScopeFactory` to create service scopes:

**Pattern:**
```csharp
using (var scope = _scopeFactory.CreateScope())
{
    var service1 = scope.ServiceProvider.GetRequiredService<IService1>();
    var service2 = scope.ServiceProvider.GetRequiredService<IService2>();
    
    // Use services within scope
}
```

**Why:**
- Background services run in singleton scope
- Services are typically registered as scoped
- Creating scopes allows proper service lifetime management

### 4. Dependency Injection Patterns

Orchestration projects depend on multiple services:

**Service Dependencies:**
- Can reference multiple service projects
- Uses service interfaces via dependency injection
- Services are resolved within scoped contexts

### 5. Logging

**Consistent Pattern:**
- All orchestration projects use `ILogger<T>` from `Microsoft.Extensions.Logging.Abstractions`
- Consistent logging patterns:
  - `_logger.LogInformation()` for operations
  - `_logger.LogError(ex, message)` for exceptions
  - `_logger.LogWarning()` for warnings

### 6. Project Configuration

**Common Properties:**
All orchestration projects use:
```xml
<TargetFramework>net8.0</TargetFramework>
<ImplicitUsings>enable</ImplicitUsings>
<Nullable>enable</Nullable>
<ProjectGuid>{GUID}</ProjectGuid>
```

**Common Dependencies:**
- `Microsoft.Extensions.Hosting` (Version 8.0.0) - For `BackgroundService`
- `Microsoft.Extensions.Logging.Abstractions` (Version 8.0.2)
- `Microsoft.Extensions.DependencyInjection.Abstractions` (Version 8.0.2)
- Service project references (as needed)

## Orchestration Qualification Criteria

### ✅ Qualifies as Orchestration When:

1. **Workflow Coordination**
   - Coordinates operations across multiple services
   - Implements processes that span service boundaries
   - Manages workflows or business processes

2. **Background Processing**
   - Implements long-running background tasks
   - Runs periodic or scheduled operations
   - Manages continuous background processes

3. **Service Composition**
   - Combines multiple services to achieve functionality
   - Acts as a composition layer
   - Orchestrates service interactions

4. **No Domain Ownership**
   - Does not own a business domain
   - Does not have its own database context or entities
   - Does not contain business logic specific to a domain

5. **Cross-Service Operations**
   - Implements operations that require multiple services
   - Manages cross-service workflows
   - Coordinates service interactions

### ❌ Does NOT Qualify as Orchestration When:

1. **Single Service Operation**
   - Operations are limited to a single service
   - Can be handled within a service's controller or service layer
   - Does not require coordination across services

2. **Business Domain Logic**
   - Contains business rules or domain models
   - Owns a business domain
   - Manages business-specific data

3. **Utility Functionality**
   - Provides cross-cutting infrastructure
   - Is a reusable tool used by services
   - Handles technical concerns (logging, caching, HTTP clients)

## Orchestration vs Service vs Utility Distinction

| Aspect | Orchestration | Service | Utility |
|--------|---------------|---------|---------|
| **Domain Ownership** | No | Yes | No |
| **Business Logic** | Coordinates | Yes | No |
| **Data Model** | No | Yes (DbContext) | No |
| **API Endpoints** | No | Yes | Optional |
| **Dependencies** | Multiple services | Independent | Used by services |
| **Purpose** | Workflow coordination | Business domain | Infrastructure |
| **Background Tasks** | Yes | No | No |

## Architecture Patterns

### Background Service Pattern

**Implementation:**
```csharp
public class [Name]BackgroundService : BackgroundService
{
    private readonly ILogger<[Name]BackgroundService> _logger;
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly TimeSpan _checkInterval = TimeSpan.FromMinutes(1);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await PerformWorkflow();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in workflow execution");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }

    private async Task PerformWorkflow()
    {
        using (var scope = _scopeFactory.CreateScope())
        {
            var service1 = scope.ServiceProvider.GetRequiredService<IService1>();
            var service2 = scope.ServiceProvider.GetRequiredService<IService2>();
            
            // Orchestrate workflow across services
        }
    }
}
```

### Registration Pattern

Orchestration services are registered in the APIs project:

```csharp
// In Program.cs or ApisServiceConfiguration.cs
services.AddHostedService<[Name]BackgroundService>();
```

## Usage Patterns

### Orchestration Coordinating Services

Orchestration projects coordinate multiple services:

- Get data from one service
- Process or transform the data
- Use another service to perform actions
- Handle errors and retries across services

### Service Independence

Services remain independent:
- Services don't know about orchestration
- Orchestration depends on services, not vice versa
- Services can be used independently or via orchestration

## Best Practices

1. **Use Service Scopes** - Always use `IServiceScopeFactory` to create scoped contexts
2. **Error Handling** - Implement comprehensive error handling and logging
3. **Graceful Shutdown** - Handle cancellation tokens properly
4. **Service Interfaces** - Use service interfaces, not implementations
5. **Logging** - Log all orchestration operations for debugging
6. **Configuration** - Use `IConfiguration` for settings (intervals, timeouts, etc.)
7. **Idempotency** - Design operations to be idempotent when possible

## Orchestration Naming Convention

Orchestration projects follow this naming pattern:

- **Project name**: `orchestration.[name]`
- **Namespace**: `orchestration.[name]`
- **Background service class**: `[Name]BackgroundService`
- **Background service folder**: `BackgroundServices/`

## Project Registration

Orchestration projects are registered in the APIs project:

```csharp
// In Program.cs or ApisServiceConfiguration.cs
services.AddHostedService<[Name]BackgroundService>();
```

The APIs project composes all services and orchestration together.

## Architecture Strengths

1. **Clear Separation of Concerns** - Orchestration handles workflows, services handle domains
2. **Service Independence** - Services remain independent and reusable
3. **Workflow Management** - Centralized workflow coordination
4. **Background Processing** - Dedicated background service support
5. **Composition** - Clean composition of multiple services
6. **Testability** - Can test orchestration independently

## Summary

**Orchestration projects** coordinate multiple services to:

1. **Implement workflows** that span multiple services
2. **Run background processes** for long-running or scheduled tasks
3. **Compose services** to achieve higher-level functionality
4. **Maintain service independence** - services don't depend on orchestration
5. **Use service scopes** for proper dependency lifetime management
6. **Follow consistent patterns** for background services and logging

Orchestration projects enable complex workflows and background processing while maintaining service independence and clear architectural boundaries.

---

**Note**: For information about what qualifies as a service, see `services-architecture.md` in the services folder. For information about utilities, see `utilities-architecture.md` in the utilities folder.
