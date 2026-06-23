using MediatR;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Commands;

public record AddMileageRecordCommand(
    Guid VehicleId,
    Guid UserId,
    DateOnly RecordDate,
    decimal CurrentMileage,
    string? Observations) : IRequest<MileageRecordDto>;

public sealed class AddMileageRecordCommandHandler : IRequestHandler<AddMileageRecordCommand, MileageRecordDto>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IAuditService _auditService;

    public AddMileageRecordCommandHandler(IVehicleRepository vehicleRepository, IAuditService auditService)
    {
        _vehicleRepository = vehicleRepository;
        _auditService = auditService;
    }

    public async Task<MileageRecordDto> Handle(AddMileageRecordCommand request, CancellationToken ct)
    {
        var vehicle = await _vehicleRepository.GetByIdWithRecordsAsync(request.VehicleId, ct)
            ?? throw new KeyNotFoundException($"Vehicle {request.VehicleId} not found.");

        if (vehicle.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        if (request.CurrentMileage < vehicle.BaseMileage)
            throw new InvalidOperationException("Current mileage cannot be less than base mileage.");

        var lastRecord = vehicle.MileageRecords
            .OrderByDescending(r => r.RecordDate)
            .FirstOrDefault();

        if (lastRecord != null && request.CurrentMileage < lastRecord.CurrentMileage)
            throw new InvalidOperationException("Current mileage cannot be less than the last recorded mileage.");

        var record = vehicle.AddMileageRecord(request.RecordDate, request.CurrentMileage, request.Observations);

        await _vehicleRepository.AddMileageRecordAsync(record, ct);
        await _vehicleRepository.UpdateAsync(vehicle, ct);
        await _vehicleRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("mileage.add", "MileageRecord", record.Id.ToString(),
            $"Added {request.CurrentMileage} km for vehicle {request.VehicleId}", ct);

        return new MileageRecordDto(
            record.Id, record.VehicleId, record.RecordDate,
            record.CurrentMileage, record.Observations, record.CreatedAt);
    }
}
