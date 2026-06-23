namespace Utilidades.Application.Interfaces;

public interface IAuditService
{
    Task LogAsync(string action, string entityType, string? entityId, string? details = null, CancellationToken ct = default);
    Task LogSecurityEventAsync(string eventType, string? userId, string? ipAddress, string details, CancellationToken ct = default);
}
