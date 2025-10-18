# Use the official .NET 8.0 SDK image as the build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and restore dependencies
COPY guras.sln ./
COPY apis/apis.csproj apis/
COPY services.users/services.users.csproj services.users/
COPY services.teachers/services.teachers.csproj services.teachers/
COPY orchestration/orchestration.csproj orchestration/
COPY utilities.aws/utilities.aws.csproj utilities.aws/
COPY utilities/utilities.csproj utilities/
COPY services.quotes/services.quotes.csproj services.quotes/
COPY services.notifications/services.notifications.csproj services.notifications/
COPY services.audio/services.audio.csproj services.audio/
COPY orchestration.backgroundServices/orchestration.backgroundServices.csproj orchestration.backgroundServices/
COPY tests/tests.csproj tests/
RUN dotnet restore

# Copy the rest of the source code
COPY apis/ apis/
COPY services.users/ services.users/
COPY services.teachers/ services.teachers/
COPY orchestration/ orchestration/
COPY utilities/ utilities/
COPY utilities.aws/ utilities.aws/
COPY services.quotes/ services.quotes/
COPY services.notifications/ services.notifications/
COPY services.audio/ services.audio/
COPY orchestration.backgroundServices/ orchestration.backgroundServices/
COPY tests/ tests/

# Build the application
WORKDIR /src/apis
RUN dotnet build -c Release -o /app/build

# Publish the application
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

# Build the runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

# Install necessary packages for production
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the published application
COPY --from=build /app/publish .

# Copy the Firebase service account file to the runtime container
COPY --from=build /src/apis/guras-firebase-adminsdk.json .

# Expose port 80
EXPOSE 80

# Set the entry point
ENTRYPOINT ["dotnet", "apis.dll"] 