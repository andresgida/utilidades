using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record CreateCatalogDeviceCommand(
    string Name,
    string Brand,
    int ReleaseYear,
    int MaxCycles,
    string? ImageUrl,
    int SortOrder) : IRequest<DeviceCatalogDto>;

public sealed class CreateCatalogDeviceCommandHandler : IRequestHandler<CreateCatalogDeviceCommand, DeviceCatalogDto>
{
    private readonly IAppleDeviceRepository _repo;

    public CreateCatalogDeviceCommandHandler(IAppleDeviceRepository repo) => _repo = repo;

    public async Task<DeviceCatalogDto> Handle(CreateCatalogDeviceCommand request, CancellationToken ct)
    {
        var item = DeviceCatalog.Create(
            request.Name, request.Brand, request.ReleaseYear,
            request.MaxCycles, true, request.ImageUrl, request.SortOrder);

        await _repo.AddCatalogAsync(item, ct);
        await _repo.SaveChangesAsync(ct);

        return new DeviceCatalogDto(item.Id, item.Name, item.Brand, item.ReleaseYear, item.MaxCycles, item.ImageUrl, item.SortOrder);
    }
}
