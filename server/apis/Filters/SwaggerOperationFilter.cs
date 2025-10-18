using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using utilities.Responses;

namespace apis.Filters;

public class AuthOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        var hasAuthorize = context.MethodInfo.DeclaringType?.GetCustomAttributes(true)
            .Union(context.MethodInfo.GetCustomAttributes(true))
            .OfType<Microsoft.AspNetCore.Authorization.AuthorizeAttribute>()
            .Any() ?? false;

        if (hasAuthorize)
        {
            operation.Security = new List<OpenApiSecurityRequirement>
            {
                new OpenApiSecurityRequirement
                {
                    [
                        new OpenApiSecurityScheme
                        {
                            Reference = new OpenApiReference
                            {
                                Type = ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        }
                    ] = new List<string>()
                }
            };
        }
    }
}

public class ResponseTypeOperationFilter : IOperationFilter
{
    public void Apply(OpenApiOperation operation, OperationFilterContext context)
    {
        // Add common response types
        operation.Responses.Add("400", new OpenApiResponse
        {
            Description = "Bad Request - Validation failed",
            Content = new Dictionary<string, OpenApiMediaType>
            {
                ["application/json"] = new OpenApiMediaType
                {
                    Schema = context.SchemaGenerator.GenerateSchema(typeof(ApiResponse), context.SchemaRepository)
                }
            }
        });

        operation.Responses.Add("401", new OpenApiResponse
        {
            Description = "Unauthorized - Authentication required"
        });

        operation.Responses.Add("500", new OpenApiResponse
        {
            Description = "Internal Server Error"
        });
    }
}
