using Utilidades.Domain.Entities;

namespace Utilidades.Domain.Interfaces;

public interface IAppleDeviceRepository
{
    Task<AppleDevice?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<AppleDevice?> GetByIdWithRecordsAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<AppleDevice>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<DeviceCatalog>> GetCatalogAsync(CancellationToken ct = default);
    Task<DeviceCatalog?> GetCatalogItemAsync(Guid id, CancellationToken ct = default);
    Task AddCatalogAsync(DeviceCatalog item, CancellationToken ct = default);
    Task DeleteCatalogAsync(DeviceCatalog item, CancellationToken ct = default);
    Task AddAsync(AppleDevice device, CancellationToken ct = default);
    Task UpdateAsync(AppleDevice device, CancellationToken ct = default);
    Task AddCycleRecordAsync(BatteryCycleRecord record, CancellationToken ct = default);
    Task<BatteryCycleRecord?> GetCycleRecordAsync(Guid recordId, CancellationToken ct = default);
    Task DeleteCycleRecordAsync(BatteryCycleRecord record, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
