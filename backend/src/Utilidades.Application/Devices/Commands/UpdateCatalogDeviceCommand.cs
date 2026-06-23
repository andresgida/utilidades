using MediatR;
using Utilidades.Application.DTOs.Devices;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record UpdateCatalogDeviceCommand(
    Guid Id,
    string Name,
    string Brand,
    int ReleaseYear,
    int MaxCycles,
    string? ImageUrl,
    int SortOrder) : IRequest<DeviceCatalogDto>;

public sealed class UpdateCatalogDeviceCommandHandler : IRequestHandler<UpdateCatalogDeviceCommand, DeviceCatalogDto>
{
    private readonly IAppleDeviceRepository _repo;

    public UpdateCatalogDeviceCommandHandler(IAppleDeviceRepository repo) => _repo = repo;

    public async Task<DeviceCatalogDto> Handle(UpdateCatalogDeviceCommand request, CancellationToken ct)
    {
        var item = await _repo.GetCatalogItemAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Catalog item {request.Id} not found.");

        item.Update(request.Name, request.Brand, request.ReleaseYear, request.MaxCycles, request.ImageUrl, request.SortOrder);
        await _repo.SaveChangesAsync(ct);

        return new DeviceCatalogDto(item.Id, item.Name, item.Brand, item.ReleaseYear, item.MaxCycles, item.ImageUrl, item.SortOrder);
    }
}
