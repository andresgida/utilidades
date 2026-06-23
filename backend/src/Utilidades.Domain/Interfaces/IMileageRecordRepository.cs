using Utilidades.Domain.Entities;

namespace Utilidades.Domain.Interfaces;

public interface IMileageRecordRepository
{
    Task<MileageRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<MileageRecord>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken ct = default);
    Task AddAsync(MileageRecord record, CancellationToken ct = default);
    Task UpdateAsync(MileageRecord record, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, Guid vehicleId, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
