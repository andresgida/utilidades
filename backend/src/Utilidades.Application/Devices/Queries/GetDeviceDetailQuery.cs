using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Queries;

public record GetDeviceDetailQuery(Guid Id, Guid UserId) : IRequest<AppleDeviceDetailDto>;

public sealed class GetDeviceDetailQueryHandler : IRequestHandler<GetDeviceDetailQuery, AppleDeviceDetailDto>
{
    private readonly IAppleDeviceRepository _deviceRepository;

    public GetDeviceDetailQueryHandler(IAppleDeviceRepository deviceRepository)
    {
        _deviceRepository = deviceRepository;
    }

    public async Task<AppleDeviceDetailDto> Handle(GetDeviceDetailQuery request, CancellationToken ct)
    {
        var device = await _deviceRepository.GetByIdWithRecordsAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Device {request.Id} not found.");

        if (device.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        var stats = device.CalculateStatistics();

        var records = device.CycleRecords
            .OrderByDescending(r => r.RecordDate)
            .Select(r => new BatteryCycleRecordDto(
                r.Id, r.AppleDeviceId, r.RecordDate, r.CurrentCycles, r.Notes, r.CreatedAt));

        return new AppleDeviceDetailDto(
            device.Id, device.DeviceName, device.CatalogDeviceId,
            device.CatalogDevice?.Name, device.CatalogDevice?.ImageUrl,
            device.PurchaseDate, device.IsCustomDevice, device.CreatedAt, records,
            new DeviceStatisticsDto(
                stats.DeviceId, stats.DaysElapsed, stats.CurrentCycles,
                stats.DailyAverage, stats.AnnualProjection,
                stats.HealthPercentage, stats.HealthStatus));
    }
}
