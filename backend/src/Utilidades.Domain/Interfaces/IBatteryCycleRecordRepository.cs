using Utilidades.Domain.Entities;

namespace Utilidades.Domain.Interfaces;

public interface IBatteryCycleRecordRepository
{
    Task<BatteryCycleRecord?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<BatteryCycleRecord>> GetByDeviceIdAsync(Guid deviceId, CancellationToken ct = default);
    Task AddAsync(BatteryCycleRecord record, CancellationToken ct = default);
    Task UpdateAsync(BatteryCycleRecord record, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, Guid deviceId, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
