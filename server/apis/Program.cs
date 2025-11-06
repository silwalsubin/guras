using apis.Configuration;
using apis.Filters;
using apis.Middleware;
using orchestration.backgroundServices.BackgroundServices;
using services.users.Configuration;
using services.notifications.Configuration;
using services.teachers.Configuration;
using utilities.ai.Configuration;
using services.meditation.Configuration;
using services.journal.Configuration;
using utilities.Persistence;
using Microsoft.OpenApi.Models;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

var dbConfiguration = builder.Configuration
    .GetSection("DbConfiguration")
    .Get<DbConfiguration>();

builder.Services.AddSingleton(dbConfiguration!);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Guras API",
        Version = "v1",
        Description = "Meditation and wellness application API",
        Contact = new OpenApiContact
        {
            Name = "Guras Development Team",
            Email = "dev@guras.com"
        }
    });

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Description = "JWT Authorization header using the Bearer scheme. Example: \"Authorization: Bearer {token}\""
    });

    options.OperationFilter<AuthOperationFilter>();
    options.OperationFilter<ResponseTypeOperationFilter>();

    // Include XML comments if available
    var xmlFile = $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

// Add MVC services for controllers with filters
builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidationActionFilter>();
    options.Filters.Add<LoggingActionFilter>();
});

// Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowVueClient", policy =>
    {
        policy.WithOrigins("http://localhost:5174", "http://localhost:3000") // Vue.js and React Native dev servers
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

ApisServiceConfiguration.ConfigureApiServices(builder.Services, builder.Configuration);

builder.Services.AddAuthenticationServices();
builder.Services.AddNotificationsServices(builder.Configuration);
builder.Services.AddTeachersServices(builder.Configuration);
builder.Services.AddMeditationServices(builder.Configuration);
builder.Services.AddAIServices(builder.Configuration);
builder.Services.AddJournalServices(builder.Configuration);

// Configure authorization
builder.Services.AddAuthorization();

// Add background services
builder.Services.AddHostedService<NotificationSchedulerBackgroundService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Guras API v1");
        options.RoutePrefix = string.Empty; // Serve Swagger UI at root
        options.DocumentTitle = "Guras API Documentation";
        options.DefaultModelsExpandDepth(-1); // Hide models section by default
    });
}

app.UseHttpsRedirection();

// Add global exception handling middleware (must be early in pipeline)
app.UseMiddleware<GlobalExceptionHandlingMiddleware>();

// Add request logging middleware
app.UseMiddleware<RequestLoggingMiddleware>();

// Enable CORS
app.UseCors("AllowVueClient");

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Add controller routing
app.MapControllers();

app.Run();
