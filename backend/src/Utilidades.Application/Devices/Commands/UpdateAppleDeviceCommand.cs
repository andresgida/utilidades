using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record UpdateAppleDeviceCommand(
    Guid Id,
    Guid UserId,
    string DeviceName,
    DateOnly PurchaseDate) : IRequest<AppleDeviceDto>;

public sealed class UpdateAppleDeviceCommandHandler : IRequestHandler<UpdateAppleDeviceCommand, AppleDeviceDto>
{
    private readonly IAppleDeviceRepository _deviceRepository;
    private readonly IAuditService _auditService;

    public UpdateAppleDeviceCommandHandler(IAppleDeviceRepository deviceRepository, IAuditService auditService)
    {
        _deviceRepository = deviceRepository;
        _auditService = auditService;
    }

    public async Task<AppleDeviceDto> Handle(UpdateAppleDeviceCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Device {request.Id} not found.");

        if (device.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        device.Update(request.DeviceName, request.PurchaseDate);
        device.SetUpdatedBy(request.UserId.ToString());

        await _deviceRepository.UpdateAsync(device, ct);
        await _deviceRepository.SaveChangesAsync(ct);
        await _auditService.LogAsync("device.update", "AppleDevice", device.Id.ToString(), null, ct);

        return new AppleDeviceDto(
            device.Id, device.DeviceName, device.CatalogDeviceId,
            device.CatalogDevice?.Name, device.PurchaseDate,
            device.IsCustomDevice, device.CreatedAt, device.CycleRecords.Count);
    }
}
