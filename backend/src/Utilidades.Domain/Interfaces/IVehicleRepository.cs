using Utilidades.Domain.Entities;

namespace Utilidades.Domain.Interfaces;

public interface IVehicleRepository
{
    Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<Vehicle?> GetByIdWithRecordsAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<Vehicle>> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
    Task AddAsync(Vehicle vehicle, CancellationToken ct = default);
    Task UpdateAsync(Vehicle vehicle, CancellationToken ct = default);
    Task AddMileageRecordAsync(MileageRecord record, CancellationToken ct = default);
    Task<MileageRecord?> GetMileageRecordAsync(Guid recordId, CancellationToken ct = default);
    Task DeleteMileageRecordAsync(MileageRecord record, CancellationToken ct = default);
    Task<bool> ExistsAsync(Guid id, Guid userId, CancellationToken ct = default);
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}
