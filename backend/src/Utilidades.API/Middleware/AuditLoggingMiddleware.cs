using System.Security.Claims;

namespace Utilidades.API.Middleware;

public class AuditLoggingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<AuditLoggingMiddleware> _logger;

    public AuditLoggingMiddleware(RequestDelegate next, ILogger<AuditLoggingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        await _next(context);

        var method = context.Request.Method;
        if (method is "POST" or "PUT" or "PATCH" or "DELETE")
        {
            var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? "anonymous";
            var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
            var path = context.Request.Path;
            var status = context.Response.StatusCode;

            _logger.LogInformation(
                "[AUDIT-HTTP] UserId={UserId} IP={Ip} Method={Method} Path={Path} Status={Status}",
                userId, ip, method, path, status);
        }
    }
}
