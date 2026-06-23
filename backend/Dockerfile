# ============================================================
# Stage 1: Development (hot-reload with dotnet watch)
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS development
WORKDIR /app

COPY Utilidades.sln ./
COPY src/Utilidades.Domain/Utilidades.Domain.csproj ./src/Utilidades.Domain/
COPY src/Utilidades.Application/Utilidades.Application.csproj ./src/Utilidades.Application/
COPY src/Utilidades.Infrastructure/Utilidades.Infrastructure.csproj ./src/Utilidades.Infrastructure/
COPY src/Utilidades.API/Utilidades.API.csproj ./src/Utilidades.API/

RUN dotnet restore src/Utilidades.API/Utilidades.API.csproj

COPY . .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000

ENTRYPOINT ["dotnet", "watch", "--project", "src/Utilidades.API", "run", "--no-launch-profile"]

# ============================================================
# Stage 2: Build
# ============================================================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /app

COPY Utilidades.sln ./
COPY src/Utilidades.Domain/Utilidades.Domain.csproj ./src/Utilidades.Domain/
COPY src/Utilidades.Application/Utilidades.Application.csproj ./src/Utilidades.Application/
COPY src/Utilidades.Infrastructure/Utilidades.Infrastructure.csproj ./src/Utilidades.Infrastructure/
COPY src/Utilidades.API/Utilidades.API.csproj ./src/Utilidades.API/

RUN dotnet restore src/Utilidades.API/Utilidades.API.csproj

COPY . .
RUN dotnet publish src/Utilidades.API/Utilidades.API.csproj \
    -c Release -o /app/publish --no-restore

# ============================================================
# Stage 3: Production
# ============================================================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS production
WORKDIR /app

RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

COPY --from=build /app/publish .

EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

ENTRYPOINT ["dotnet", "Utilidades.API.dll"]
