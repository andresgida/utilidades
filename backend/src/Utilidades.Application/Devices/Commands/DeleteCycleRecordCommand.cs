using MediatR;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record DeleteCycleRecordCommand(Guid RecordId, Guid DeviceId, Guid UserId) : IRequest;

public sealed class DeleteCycleRecordCommandHandler : IRequestHandler<DeleteCycleRecordCommand>
{
    private readonly IAppleDeviceRepository _deviceRepository;
    private readonly IAuditService _auditService;

    public DeleteCycleRecordCommandHandler(IAppleDeviceRepository deviceRepository, IAuditService auditService)
    {
        _deviceRepository = deviceRepository;
        _auditService = auditService;
    }

    public async Task Handle(DeleteCycleRecordCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, ct)
            ?? throw new KeyNotFoundException($"Device {request.DeviceId} not found.");

        if (device.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        var record = await _deviceRepository.GetCycleRecordAsync(request.RecordId, ct)
            ?? throw new KeyNotFoundException($"Record {request.RecordId} not found.");

        if (record.AppleDeviceId != request.DeviceId)
            throw new UnauthorizedAccessException("Access denied.");

        await _deviceRepository.DeleteCycleRecordAsync(record, ct);
        await _deviceRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("cycle.delete", "BatteryCycleRecord", record.Id.ToString(), null, ct);
    }
}
