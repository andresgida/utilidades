using MediatR;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Commands;

public record UpdateMileageRecordCommand(
    Guid RecordId,
    Guid VehicleId,
    Guid UserId,
    DateOnly RecordDate,
    decimal CurrentMileage,
    string? Observations) : IRequest<MileageRecordDto>;

public sealed class UpdateMileageRecordCommandHandler : IRequestHandler<UpdateMileageRecordCommand, MileageRecordDto>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IAuditService _auditService;

    public UpdateMileageRecordCommandHandler(IVehicleRepository vehicleRepository, IAuditService auditService)
    {
        _vehicleRepository = vehicleRepository;
        _auditService = auditService;
    }

    public async Task<MileageRecordDto> Handle(UpdateMileageRecordCommand request, CancellationToken ct)
    {
        var vehicle = await _vehicleRepository.GetByIdWithRecordsAsync(request.VehicleId, ct)
            ?? throw new KeyNotFoundException($"Vehicle {request.VehicleId} not found.");

        if (vehicle.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        var record = await _vehicleRepository.GetMileageRecordAsync(request.RecordId, ct)
            ?? throw new KeyNotFoundException($"Record {request.RecordId} not found.");

        if (record.VehicleId != request.VehicleId)
            throw new UnauthorizedAccessException("Access denied.");

        record.Update(request.RecordDate, request.CurrentMileage, request.Observations);

        await _vehicleRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("mileage.update", "MileageRecord", record.Id.ToString(),
            $"Updated record {request.RecordId} to {request.CurrentMileage} km", ct);

        return new MileageRecordDto(
            record.Id, record.VehicleId, record.RecordDate,
            record.CurrentMileage, record.Observations, record.CreatedAt);
    }
}
