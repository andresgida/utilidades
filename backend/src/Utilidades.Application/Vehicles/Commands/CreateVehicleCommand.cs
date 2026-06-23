using MediatR;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Commands;

public record CreateVehicleCommand(
    Guid UserId,
    string Name,
    string Brand,
    string Model,
    int Year,
    string? LicensePlate,
    DateOnly StartCountDate,
    decimal BaseMileage) : IRequest<VehicleDto>;

public sealed class CreateVehicleCommandHandler : IRequestHandler<CreateVehicleCommand, VehicleDto>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IAuditService _auditService;

    public CreateVehicleCommandHandler(IVehicleRepository vehicleRepository, IAuditService auditService)
    {
        _vehicleRepository = vehicleRepository;
        _auditService = auditService;
    }

    public async Task<VehicleDto> Handle(CreateVehicleCommand request, CancellationToken ct)
    {
        var vehicle = Vehicle.Create(
            request.UserId,
            request.Name,
            request.Brand,
            request.Model,
            request.Year,
            request.StartCountDate,
            request.BaseMileage,
            request.LicensePlate);

        await _vehicleRepository.AddAsync(vehicle, ct);
        await _vehicleRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("vehicle.create", "Vehicle", vehicle.Id.ToString(),
            $"Created vehicle '{vehicle.Name}' for user {request.UserId}", ct);

        return MapToDto(vehicle);
    }

    private static VehicleDto MapToDto(Vehicle v) => new(
        v.Id, v.Name, v.Brand, v.Model, v.Year, v.LicensePlate,
        v.StartCountDate, v.BaseMileage, v.IsActive, v.CreatedAt, v.MileageRecords.Count);
}
