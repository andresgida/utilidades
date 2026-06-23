using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record CreateAppleDeviceCommand(
    Guid UserId,
    string DeviceName,
    DateOnly PurchaseDate,
    Guid? CatalogDeviceId,
    bool IsCustomDevice) : IRequest<AppleDeviceDto>;

public sealed class CreateAppleDeviceCommandHandler : IRequestHandler<CreateAppleDeviceCommand, AppleDeviceDto>
{
    private readonly IAppleDeviceRepository _deviceRepository;
    private readonly IAuditService _auditService;

    public CreateAppleDeviceCommandHandler(IAppleDeviceRepository deviceRepository, IAuditService auditService)
    {
        _deviceRepository = deviceRepository;
        _auditService = auditService;
    }

    public async Task<AppleDeviceDto> Handle(CreateAppleDeviceCommand request, CancellationToken ct)
    {
        var device = AppleDevice.Create(
            request.UserId,
            request.DeviceName,
            request.PurchaseDate,
            request.CatalogDeviceId,
            request.IsCustomDevice);

        await _deviceRepository.AddAsync(device, ct);
        await _deviceRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("device.create", "AppleDevice", device.Id.ToString(),
            $"Created device '{device.DeviceName}' for user {request.UserId}", ct);

        return new AppleDeviceDto(
            device.Id, device.DeviceName, device.CatalogDeviceId,
            null, device.PurchaseDate, device.IsCustomDevice,
            device.CreatedAt, 0);
    }
}
