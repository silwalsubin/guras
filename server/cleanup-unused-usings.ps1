# PowerShell script to clean up unused usings across the entire solution

Write-Host "Cleaning up unused usings across the entire solution..." -ForegroundColor Green

# Clean up all projects in the solution
Write-Host "Cleaning up apis project..." -ForegroundColor Yellow
dotnet format server/apis/apis.csproj --verbosity minimal

Write-Host "Cleaning up services.teachers project..." -ForegroundColor Yellow
dotnet format server/services.teachers/services.teachers.csproj --verbosity minimal

Write-Host "Cleaning up services.users project..." -ForegroundColor Yellow
dotnet format server/services.users/services.users.csproj --verbosity minimal

Write-Host "Cleaning up services.quotes project..." -ForegroundColor Yellow
dotnet format server/services.quotes/services.quotes.csproj --verbosity minimal

Write-Host "Cleaning up services.notifications project..." -ForegroundColor Yellow
dotnet format server/services.notifications/services.notifications.csproj --verbosity minimal

Write-Host "Cleaning up services.audio project..." -ForegroundColor Yellow
dotnet format server/services.audio/services.audio.csproj --verbosity minimal

Write-Host "Cleaning up utilities project..." -ForegroundColor Yellow
dotnet format server/utilities/utilities.csproj --verbosity minimal

Write-Host "Cleaning up utilities.aws project..." -ForegroundColor Yellow
dotnet format server/utilities.aws/utilities.aws.csproj --verbosity minimal

Write-Host "Cleaning up tests project..." -ForegroundColor Yellow
dotnet format server/tests/tests.csproj --verbosity minimal

Write-Host "Cleanup complete! All unused usings have been removed." -ForegroundColor Green
Write-Host "Tip: Run 'dotnet build' to verify no warnings remain." -ForegroundColor Cyan