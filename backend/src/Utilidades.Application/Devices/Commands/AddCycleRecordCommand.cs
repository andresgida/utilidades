using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record AddCycleRecordCommand(
    Guid DeviceId,
    Guid UserId,
    DateOnly RecordDate,
    int CurrentCycles,
    string? Notes) : IRequest<BatteryCycleRecordDto>;

public sealed class AddCycleRecordCommandHandler : IRequestHandler<AddCycleRecordCommand, BatteryCycleRecordDto>
{
    private readonly IAppleDeviceRepository _deviceRepository;
    private readonly IAuditService _auditService;

    public AddCycleRecordCommandHandler(IAppleDeviceRepository deviceRepository, IAuditService auditService)
    {
        _deviceRepository = deviceRepository;
        _auditService = auditService;
    }

    public async Task<BatteryCycleRecordDto> Handle(AddCycleRecordCommand request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdWithRecordsAsync(request.DeviceId, ct)
            ?? throw new KeyNotFoundException($"Device {request.DeviceId} not found.");

        if (device.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        if (request.CurrentCycles < 0)
            throw new InvalidOperationException("Cycle count cannot be negative.");

        var record = device.AddCycleRecord(request.RecordDate, request.CurrentCycles, request.Notes);

        await _deviceRepository.AddCycleRecordAsync(record, ct);
        await _deviceRepository.UpdateAsync(device, ct);
        await _deviceRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("cycle.add", "BatteryCycleRecord", record.Id.ToString(),
            $"Added {request.CurrentCycles} cycles for device {request.DeviceId}", ct);

        return new BatteryCycleRecordDto(
            record.Id, record.AppleDeviceId, record.RecordDate,
            record.CurrentCycles, record.Notes, record.CreatedAt);
    }
}
