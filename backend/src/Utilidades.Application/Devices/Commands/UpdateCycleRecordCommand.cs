using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record UpdateCycleRecordCommand(
    Guid RecordId,
    Guid DeviceId,
    Guid UserId,
    DateOnly RecordDate,
    int CurrentCycles,
    string? Notes) : IRequest<BatteryCycleRecordDto>;

public sealed class UpdateCycleRecordCommandHandler : IRequestHandler<UpdateCycleRecordCommand, BatteryCycleRecordDto>
{
    private readonly IAppleDeviceRepository _deviceRepository;
    private readonly IAuditService _auditService;

    public UpdateCycleRecordCommandHandler(IAppleDeviceRepository deviceRepository, IAuditService auditService)
    {
        _deviceRepository = deviceRepository;
        _auditService = auditService;
    }

    public async Task<BatteryCycleRecordDto> Handle(UpdateCycleRecordCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdAsync(request.DeviceId, ct)
            ?? throw new KeyNotFoundException($"Device {request.DeviceId} not found.");

        if (device.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        var record = await _deviceRepository.GetCycleRecordAsync(request.RecordId, ct)
            ?? throw new KeyNotFoundException($"Record {request.RecordId} not found.");

        if (record.AppleDeviceId != request.DeviceId)
            throw new UnauthorizedAccessException("Access denied.");

        record.Update(request.RecordDate, request.CurrentCycles, request.Notes);

        await _deviceRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("cycle.update", "BatteryCycleRecord", record.Id.ToString(),
            $"Updated cycle record {request.RecordId}", ct);

        return new BatteryCycleRecordDto(
            record.Id, record.AppleDeviceId, record.RecordDate,
            record.CurrentCycles, record.Notes, record.CreatedAt);
    }
}
