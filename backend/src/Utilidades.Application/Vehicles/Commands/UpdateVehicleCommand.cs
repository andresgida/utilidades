using MediatR;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Commands;

public record UpdateVehicleCommand(
    Guid Id,
    Guid UserId,
    string Name,
    string Brand,
    string Model,
    int Year,
    string? LicensePlate,
    DateOnly StartCountDate,
    decimal BaseMileage,
    string? ImageUrl = null) : IRequest<VehicleDto>;

public sealed class UpdateVehicleCommandHandler : IRequestHandler<UpdateVehicleCommand, VehicleDto>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IAuditService _auditService;

    public UpdateVehicleCommandHandler(IVehicleRepository vehicleRepository, IAuditService auditService)
    {
        _vehicleRepository = vehicleRepository;
        _auditService = auditService;
    }

    public async Task<VehicleDto> Handle(UpdateVehicleCommand request, CancellationToken ct)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Vehicle {request.Id} not found.");

        if (vehicle.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        vehicle.Update(request.Name, request.Brand, request.Model, request.Year,
            request.LicensePlate, request.StartCountDate, request.BaseMileage, request.ImageUrl);
        vehicle.SetUpdatedBy(request.UserId.ToString());

        await _vehicleRepository.UpdateAsync(vehicle, ct);
        await _vehicleRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("vehicle.update", "Vehicle", vehicle.Id.ToString(), null, ct);

        return new VehicleDto(
            vehicle.Id, vehicle.Name, vehicle.Brand, vehicle.Model, vehicle.Year,
            vehicle.LicensePlate, vehicle.StartCountDate, vehicle.BaseMileage,
            vehicle.IsActive, vehicle.CreatedAt, vehicle.MileageRecords.Count, vehicle.ImageUrl);
    }
}
