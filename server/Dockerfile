# Use the official .NET 8.0 SDK image as the build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and restore dependencies
COPY guras.sln ./
COPY apis/apis.csproj apis/
COPY services/services.users/services.users.csproj services/services.users/
COPY services/services.teachers/services.teachers.csproj services/services.teachers/
COPY utilities/utilities.ai/utilities.ai.csproj utilities/utilities.ai/
COPY services/services.meditation/services.meditation.csproj services/services.meditation/
COPY services/services.journal/services.journal.csproj services/services.journal/
COPY orchestration/orchestration.csproj orchestration/
COPY utilities/utilities.aws/utilities.aws.csproj utilities/utilities.aws/
COPY utilities/utilities/utilities.csproj utilities/utilities/
COPY services/services.quotes/services.quotes.csproj services/services.quotes/
COPY services/services.notifications/services.notifications.csproj services/services.notifications/
COPY services/services.audio/services.audio.csproj services/services.audio/
COPY orchestration.backgroundServices/orchestration.backgroundServices.csproj orchestration.backgroundServices/
COPY tests/tests.csproj tests/
RUN dotnet restore

# Copy the rest of the source code
COPY apis/ apis/
COPY services/services.users/ services/services.users/
COPY services/services.teachers/ services/services.teachers/
COPY utilities/utilities.ai/ utilities/utilities.ai/
COPY services/services.meditation/ services/services.meditation/
COPY services/services.journal/ services/services.journal/
COPY orchestration/ orchestration/
COPY utilities/ utilities/
COPY utilities/utilities.aws/ utilities/utilities.aws/
COPY services/services.quotes/ services/services.quotes/
COPY services/services.notifications/ services/services.notifications/
COPY services/services.audio/ services/services.audio/
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