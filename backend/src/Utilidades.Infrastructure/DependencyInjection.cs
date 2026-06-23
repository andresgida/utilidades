using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;
using Utilidades.Infrastructure.Persistence;
using Utilidades.Infrastructure.Repositories;
using Utilidades.Infrastructure.Security;
using Utilidades.Infrastructure.Services;

namespace Utilidades.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        // ── Database ──────────────────────────────────────────────
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseNpgsql(
                configuration.GetConnectionString("DefaultConnection"),
                npgsql => npgsql.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        // ── Repositories ──────────────────────────────────────────
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IVehicleRepository, VehicleRepository>();
        services.AddScoped<IAppleDeviceRepository, AppleDeviceRepository>();
        services.AddScoped<IMileageRecordRepository, MileageRecordRepository>();
        services.AddScoped<IBatteryCycleRecordRepository, BatteryCycleRecordRepository>();

        // ── Security ──────────────────────────────────────────────
        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IPasswordHasher, PasswordHasher>();

        // ── Services ──────────────────────────────────────────────
        services.AddScoped<IAuditService, AuditService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddHttpContextAccessor();

        // ── JWT Authentication ─────────────────────────────────────
        var jwtSecret = configuration["JWT:Secret"]
            ?? throw new InvalidOperationException("JWT:Secret is not configured.");

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
                ValidateIssuer = true,
                ValidIssuer = configuration["JWT:Issuer"],
                ValidateAudience = true,
                ValidAudience = configuration["JWT:Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.FromSeconds(30)
            };

            options.Events = new JwtBearerEvents
            {
                OnAuthenticationFailed = ctx =>
                {
                    if (ctx.Exception is SecurityTokenExpiredException)
                        ctx.Response.Headers["Token-Expired"] = "true";
                    return Task.CompletedTask;
                }
            };
        });

        return services;
    }

    public static async Task ApplyMigrationsAsync(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        await db.Database.MigrateAsync();
        await SeedCatalogImageUrlsAsync(db);
    }

    private static async Task SeedCatalogImageUrlsAsync(ApplicationDbContext db)
    {
        var imageMap = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            ["iPhone 13"]         = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-01.jpg",
            ["iPhone 13 Mini"]    = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-mini-01.jpg",
            ["iPhone 13 Pro"]     = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-01.jpg",
            ["iPhone 13 Pro Max"] = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-13-pro-max-01.jpg",
            ["iPhone 14"]         = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-01.jpg",
            ["iPhone 14 Plus"]    = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-plus-01.jpg",
            ["iPhone 14 Pro"]     = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-01.jpg",
            ["iPhone 14 Pro Max"] = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-14-pro-max-01.jpg",
            ["iPhone 15"]         = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-01.jpg",
            ["iPhone 15 Plus"]    = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-plus-01.jpg",
            ["iPhone 15 Pro"]     = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-01.jpg",
            ["iPhone 15 Pro Max"] = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-15-pro-max-01.jpg",
            ["iPhone 16"]         = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-01.jpg",
            ["iPhone 16 Plus"]    = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-plus-01.jpg",
            ["iPhone 16 Pro"]     = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-01.jpg",
            ["iPhone 16 Pro Max"] = "https://fdn2.gsmarena.com/vv/pics/apple/apple-iphone-16-pro-max-01.jpg",
        };

        var items = await db.DeviceCatalog
            .Where(c => c.ImageUrl == null)
            .ToListAsync();

        if (!items.Any()) return;

        foreach (var item in items)
        {
            if (imageMap.TryGetValue(item.Name, out var url))
                item.Update(item.Name, item.Brand, item.ReleaseYear, item.MaxCycles, url, item.SortOrder);
        }

        await db.SaveChangesAsync();
    }
}
