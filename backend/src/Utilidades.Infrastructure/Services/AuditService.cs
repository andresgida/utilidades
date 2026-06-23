using Microsoft.Extensions.Logging;
using Utilidades.Application.Interfaces;

namespace Utilidades.Infrastructure.Services;

public class AuditService : IAuditService
{
    private readonly ILogger<AuditService> _logger;

    public AuditService(ILogger<AuditService> logger) => _logger = logger;

    public Task LogAsync(
        string action,
        string entityType,
        string? entityId,
        string? details = null,
        CancellationToken ct = default)
    {
        _logger.LogInformation(
            "[AUDIT] Action={Action} EntityType={EntityType} EntityId={EntityId} Details={Details}",
            action, entityType, entityId ?? "N/A", details ?? string.Empty);

        return Task.CompletedTask;
    }

    public Task LogSecurityEventAsync(
        string eventType,
        string? userId,
        string? ipAddress,
        string details,
        CancellationToken ct = default)
    {
        _logger.LogWarning(
            "[SECURITY] EventType={EventType} UserId={UserId} IpAddress={IpAddress} Details={Details}",
            eventType, userId ?? "anonymous", ipAddress ?? "unknown", details);

        return Task.CompletedTask;
    }
}
