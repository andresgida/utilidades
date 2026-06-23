using MediatR;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record DeleteAppleDeviceCommand(Guid Id, Guid UserId) : IRequest<bool>;

public sealed class DeleteAppleDeviceCommandHandler : IRequestHandler<DeleteAppleDeviceCommand, bool>
{
    private readonly IAppleDeviceRepository _deviceRepository;
    private readonly IAuditService _auditService;

    public DeleteAppleDeviceCommandHandler(IAppleDeviceRepository deviceRepository, IAuditService auditService)
    {
        _deviceRepository = deviceRepository;
        _auditService = auditService;
    }

    public async Task<bool> Handle(DeleteAppleDeviceCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Device {request.Id} not found.");

        if (device.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        device.SoftDelete(request.UserId.ToString());
        await _deviceRepository.UpdateAsync(device, ct);
        await _deviceRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("device.delete", "AppleDevice", device.Id.ToString(), null, ct);
        return true;
    }
}
