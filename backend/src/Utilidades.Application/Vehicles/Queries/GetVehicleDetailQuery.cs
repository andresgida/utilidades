using MediatR;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Queries;

public record GetVehicleDetailQuery(Guid Id, Guid UserId) : IRequest<VehicleDetailDto>;

public sealed class GetVehicleDetailQueryHandler : IRequestHandler<GetVehicleDetailQuery, VehicleDetailDto>
{
    private readonly IVehicleRepository _vehicleRepository;

    public GetVehicleDetailQueryHandler(IVehicleRepository vehicleRepository)
    {
        _vehicleRepository = vehicleRepository;
    }

    public async Task<VehicleDetailDto> Handle(GetVehicleDetailQuery request, CancellationToken ct)
    {
        var vehicle = await _vehicleRepository.GetByIdWithRecordsAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Vehicle {request.Id} not found.");

        if (vehicle.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        var stats = vehicle.CalculateStatistics();

        var records = vehicle.MileageRecords
            .OrderByDescending(r => r.RecordDate)
            .Select(r => new MileageRecordDto(
                r.Id, r.VehicleId, r.RecordDate, r.CurrentMileage, r.Observations, r.CreatedAt));

        return new VehicleDetailDto(
            vehicle.Id, vehicle.Name, vehicle.Brand, vehicle.Model, vehicle.Year,
            vehicle.LicensePlate, vehicle.StartCountDate, vehicle.BaseMileage,
            vehicle.IsActive, vehicle.CreatedAt, records,
            new VehicleStatisticsDto(
                stats.VehicleId, stats.DaysElapsed, stats.KmTraveled,
                stats.DailyAverage, stats.AnnualProjection, stats.CurrentMileage));
    }
}
