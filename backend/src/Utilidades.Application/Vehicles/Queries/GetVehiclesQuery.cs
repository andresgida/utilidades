using MediatR;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Queries;

public record GetVehiclesQuery(Guid UserId) : IRequest<IEnumerable<VehicleDto>>;

public sealed class GetVehiclesQueryHandler : IRequestHandler<GetVehiclesQuery, IEnumerable<VehicleDto>>
{
    private readonly IVehicleRepository _vehicleRepository;

    public GetVehiclesQueryHandler(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    public async Task<IEnumerable<VehicleDto>> Handle(GetVehiclesQuery request, CancellationToken ct)
    {
        var vehicles = await _vehicleRepository.GetByUserIdAsync(request.UserId, ct);

        return vehicles.Select(v => new VehicleDto(
            v.Id, v.Name, v.Brand, v.Model, v.Year,
            v.LicensePlate, v.StartCountDate, v.BaseMileage,
            v.IsActive, v.CreatedAt, v.MileageRecords.Count));
    }
}
