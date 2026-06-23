using MediatR;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Commands;

public record DeleteMileageRecordCommand(Guid RecordId, Guid VehicleId, Guid UserId) : IRequest;

public sealed class DeleteMileageRecordCommandHandler : IRequestHandler<DeleteMileageRecordCommand>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IAuditService _auditService;

    public DeleteMileageRecordCommandHandler(IVehicleRepository vehicleRepository, IAuditService auditService)
    {
        _vehicleRepository = vehicleRepository;
        _auditService = auditService;
    }

    public async Task Handle(DeleteMileageRecordCommand request, CancellationToken ct)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.VehicleId, ct)
            ?? throw new KeyNotFoundException($"Vehicle {request.VehicleId} not found.");

        if (vehicle.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        var record = await _vehicleRepository.GetMileageRecordAsync(request.RecordId, ct)
            ?? throw new KeyNotFoundException($"Record {request.RecordId} not found.");

        if (record.VehicleId != request.VehicleId)
            throw new UnauthorizedAccessException("Access denied.");

        await _vehicleRepository.DeleteMileageRecordAsync(record, ct);
        await _vehicleRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("mileage.delete", "MileageRecord", record.Id.ToString(), null, ct);
    }
}
