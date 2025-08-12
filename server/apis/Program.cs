using apis.Configuration;
using orchestration.backgroundServices.BackgroundServices;
using services.authentication.Configuration;
using services.notifications.Configuration;
using utilities.Persistence;

var builder = WebApplication.CreateBuilder(args);

var dbConfiguration = builder.Configuration
    .GetSection("DbConfiguration")
    .Get<DbConfiguration>();

builder.Services.AddSingleton(dbConfiguration!);

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Add MVC services for controllers
builder.Services.AddControllers();

ApisServiceConfiguration.ConfigureApiServices(builder.Services);

builder.Services.AddAuthenticationServices();
builder.Services.AddNotificationsServices();

// Configure authorization
builder.Services.AddAuthorization();

// Add background services
builder.Services.AddHostedService<NotificationSchedulerBackgroundService>();

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