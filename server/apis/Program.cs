using apis.Authentication;
using apis.Configuration;
using apis.Services;
using Microsoft.AspNetCore.Authentication;
using FirebaseAdmin;
using Google.Apis.Auth.OAuth2;
using System.IO;

var builder = WebApplication.CreateBuilder(args);

// Initialize Firebase Admin SDK
var firebaseConfig = builder.Configuration.GetSection("Firebase");
var serviceAccountPath = firebaseConfig["ServiceAccountPath"];

if (!string.IsNullOrEmpty(serviceAccountPath) && File.Exists(serviceAccountPath))
{
    try
    {
        FirebaseApp.Create(new AppOptions()
        {
            Credential = GoogleCredential.FromFile(serviceAccountPath),
        });
        Console.WriteLine("✅ Firebase Admin SDK initialized successfully");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Failed to initialize Firebase Admin SDK: {ex.Message}");
    }
}
else
{
    Console.WriteLine("⚠️ Firebase service account file not found. Push notifications will not work.");
}

var appSettingsDbConfiguration = builder.Configuration
    .GetSection("DbConfiguration")
    .Get<DbConfiguration>();

builder.Services.AddSingleton(appSettingsDbConfiguration!);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add MVC services for controllers
builder.Services.AddControllers();

builder.Services.ConfigureServices();

// Configure authentication
builder.Services.AddAuthentication("Firebase")
    .AddScheme<AuthenticationSchemeOptions, FirebaseAuthenticationHandler>("Firebase", _ => { });

// Configure authorization
builder.Services.AddAuthorization();

// Add background services
builder.Services.AddHostedService<NotificationSchedulerService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Add authentication and authorization middleware
app.UseAuthentication();
app.UseAuthorization();

// Add controller routing
app.MapControllers();

app.Run();