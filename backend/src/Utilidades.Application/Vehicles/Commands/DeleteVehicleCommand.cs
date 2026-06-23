using MediatR;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Vehicles.Commands;

public record DeleteVehicleCommand(Guid Id, Guid UserId) : IRequest<bool>;

public sealed class DeleteVehicleCommandHandler : IRequestHandler<DeleteVehicleCommand, bool>
{
    private readonly IVehicleRepository _vehicleRepository;
    private readonly IAuditService _auditService;

    public DeleteVehicleCommandHandler(IVehicleRepository vehicleRepository, IAuditService auditService)
    {
        _vehicleRepository = vehicleRepository;
        _auditService = auditService;
    }

    public async Task<bool> Handle(DeleteVehicleCommand request, CancellationToken ct)
    {
        var vehicle = await _vehicleRepository.GetByIdAsync(request.Id, ct)
            ?? throw new KeyNotFoundException($"Vehicle {request.Id} not found.");

        if (vehicle.UserId != request.UserId)
            throw new UnauthorizedAccessException("Access denied.");

        vehicle.SoftDelete(request.UserId.ToString());
        await _vehicleRepository.UpdateAsync(vehicle, ct);
        await _vehicleRepository.SaveChangesAsync(ct);

        await _auditService.LogAsync("vehicle.delete", "Vehicle", vehicle.Id.ToString(), null, ct);
        return true;
    }
}
