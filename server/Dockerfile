# Use the official .NET 8.0 SDK image as the build image
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution file and restore dependencies
COPY guras.sln ./
COPY apis/apis.csproj apis/
RUN dotnet restore

# Copy the rest of the source code
COPY . .

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
COPY --from=build /src/apis/guras-firebase-adminsdk.json ./apis/

# Expose port 80
EXPOSE 80

# Set the entry point
ENTRYPOINT ["dotnet", "apis.dll"] 