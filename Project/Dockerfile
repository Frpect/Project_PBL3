FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy csproj and restore as distinct layers
COPY ["Project.csproj", "./"]
RUN dotnet restore "./Project.csproj"

# Copy everything else and build
COPY . .
RUN dotnet build "Project.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "Project.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Build runtime image
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Expose port 80 for the container
EXPOSE 80
EXPOSE 443

ENTRYPOINT ["dotnet", "Project.dll"]
