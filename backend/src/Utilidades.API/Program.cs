using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Serilog;
using Serilog.Events;
using Utilidades.API.Middleware;
using Utilidades.Application;
using Utilidades.Infrastructure;

Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Override("Microsoft", LogEventLevel.Information)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .CreateBootstrapLogger();

try
{
    Log.Information("Starting UTILIDADES API...");

    var builder = WebApplication.CreateBuilder(args);

    // ── Serilog ───────────────────────────────────────────────────
    builder.Host.UseSerilog((ctx, services, cfg) => cfg
        .ReadFrom.Configuration(ctx.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .WriteTo.Console(new Serilog.Formatting.Compact.CompactJsonFormatter())
        .WriteTo.File("logs/utilidades-.log",
            rollingInterval: RollingInterval.Day,
            retainedFileCountLimit: 30));

    // ── Application & Infrastructure ─────────────────────────────
    builder.Services.AddApplication();
    builder.Services.AddInfrastructure(builder.Configuration);

    // ── Controllers ───────────────────────────────────────────────
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();

    // ── Swagger ───────────────────────────────────────────────────
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new()
        {
            Title = "UTILIDADES API",
            Version = "v1",
            Description = "Enterprise modular platform API — Vehicles & iPhone Cycles"
        });

        c.AddSecurityDefinition("Bearer", new()
        {
            Name = "Authorization",
            Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            In = Microsoft.OpenApi.Models.ParameterLocation.Header,
            Description = "Enter your JWT access token."
        });

        c.AddSecurityRequirement(new()
        {
            {
                new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" }
                },
                []
            }
        });
    });

    // ── CORS ──────────────────────────────────────────────────────
    var allowedOrigins = builder.Configuration.GetSection("AllowedOrigins").Get<string[]>()
        ?? builder.Configuration["AllowedOrigins"]?.Split(',')
        ?? ["http://localhost:4200"];

    builder.Services.AddCors(opts =>
        opts.AddPolicy("UtilidadesCors", policy => policy
            .WithOrigins(allowedOrigins)
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials()));

    // ── Rate Limiting ─────────────────────────────────────────────
    builder.Services.AddRateLimiter(opts =>
    {
        opts.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
            RateLimitPartition.GetFixedWindowLimiter(
                ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                _ => new FixedWindowRateLimiterOptions
                {
                    PermitLimit = 100,
                    Window = TimeSpan.FromMinutes(1),
                    QueueLimit = 10
                }));

        opts.AddFixedWindowLimiter("auth", o =>
        {
            o.PermitLimit = 10;
            o.Window = TimeSpan.FromMinutes(1);
            o.QueueLimit = 0;
        });

        opts.OnRejected = async (ctx, ct) =>
        {
            ctx.HttpContext.Response.StatusCode = 429;
            await ctx.HttpContext.Response.WriteAsJsonAsync(
                new { error = "Too many requests. Please slow down." }, ct);
        };
    });

    // ── Health Checks ─────────────────────────────────────────────
    builder.Services.AddHealthChecks();

    var app = builder.Build();

    // ── Auto-migrate on startup ───────────────────────────────────
    await app.Services.ApplyMigrationsAsync();

    // ── Middleware pipeline ───────────────────────────────────────
    app.UseSerilogRequestLogging(opts =>
    {
        opts.MessageTemplate = "{RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000}ms";
    });

    app.UseMiddleware<GlobalExceptionHandlingMiddleware>();
    app.UseMiddleware<SecurityHeadersMiddleware>();

    if (app.Environment.IsDevelopment())
    {
        app.UseSwagger();
        app.UseSwaggerUI(c =>
        {
            c.SwaggerEndpoint("/swagger/v1/swagger.json", "UTILIDADES API v1");
            c.RoutePrefix = "swagger";
            c.DisplayRequestDuration();
        });
    }

    app.UseHttpsRedirection();
    app.UseCors("UtilidadesCors");
    app.UseRateLimiter();
    app.UseAuthentication();
    app.UseAuthorization();
    app.UseMiddleware<AuditLoggingMiddleware>();

    app.MapControllers();
    app.MapHealthChecks("/health");

    Log.Information("UTILIDADES API started successfully.");
    await app.RunAsync();
}
catch (Exception ex)
{
    Log.Fatal(ex, "UTILIDADES API failed to start.");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
