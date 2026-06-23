using MediatR;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Devices.Commands;

public record DeleteCatalogDeviceCommand(Guid Id) : IRequest;

public sealed class DeleteCatalogDeviceCommandHandler : IRequestHandler<DeleteCatalogDeviceCommand>
{
    private readonly IAppleDeviceRepository _repo;

    public DeleteCatalogDeviceCommandHandler(IAppleDeviceRepository repo) => _repo = repo;

    public async Task Handle(DeleteCatalogDeviceCommand request, CancellationToken ct)
    {
        var item = await _repo.GetCatalogItemAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Catalog item {request.Id} not found.");

        await _repo.DeleteCatalogAsync(item, ct);
        await _repo.SaveChangesAsync(ct);
    }
}
