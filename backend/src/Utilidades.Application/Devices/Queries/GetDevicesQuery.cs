using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Queries;

public record GetDevicesQuery(Guid UserId) : IRequest<IEnumerable<AppleDeviceDto>>;

public sealed class GetDevicesQueryHandler : IRequestHandler<GetDevicesQuery, IEnumerable<AppleDeviceDto>>
{
    private readonly IAppleDeviceRepository _deviceRepository;

    public GetDevicesQueryHandler(IAppleDeviceRepository deviceRepository)
    {
        _deviceRepository = deviceRepository;
    }

    public async Task<IEnumerable<AppleDeviceDto>> Handle(GetDevicesQuery request, CancellationToken ct)
    {
        var devices = await _deviceRepository.GetByUserIdAsync(request.UserId, ct);

        return devices.Select(d => new AppleDeviceDto(
            d.Id, d.DeviceName, d.CatalogDeviceId,
            d.CatalogDevice?.Name, d.CatalogDevice?.ImageUrl,
            d.PurchaseDate, d.IsCustomDevice, d.CreatedAt, d.CycleRecords.Count));
    }
}

public record GetDeviceCatalogQuery : IRequest<IEnumerable<DeviceCatalogDto>>;

public sealed class GetDeviceCatalogQueryHandler : IRequestHandler<GetDeviceCatalogQuery, IEnumerable<DeviceCatalogDto>>
{
    private readonly IAppleDeviceRepository _deviceRepository;

    public GetDeviceCatalogQueryHandler(IAppleDeviceRepository deviceRepository)
    {
        _deviceRepository = deviceRepository;
    }

    public async Task<IEnumerable<DeviceCatalogDto>> Handle(GetDeviceCatalogQuery request, CancellationToken ct)
    {
        var catalog = await _deviceRepository.GetCatalogAsync(ct);
        return catalog
            .OrderBy(c => c.SortOrder)
            .Select(c => new DeviceCatalogDto(c.Id, c.Name, c.Brand, c.ReleaseYear, c.MaxCycles, c.ImageUrl, c.SortOrder));
    }
}
