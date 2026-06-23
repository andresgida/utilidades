using Microsoft.EntityFrameworkCore;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;
using Utilidades.Infrastructure.Persistence;

namespace Utilidades.Infrastructure.Repositories;

public class AppleDeviceRepository : IAppleDeviceRepository
{
    private readonly ApplicationDbContext _db;

    public AppleDeviceRepository(ApplicationDbContext db) => _db = db;

    public async Task<AppleDevice?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.AppleDevices
            .Include(d => d.CatalogDevice)
            .FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task<AppleDevice?> GetByIdWithRecordsAsync(Guid id, CancellationToken ct = default) =>
        await _db.AppleDevices
            .Include(d => d.CatalogDevice)
            .Include(d => d.CycleRecords.Where(r => !r.IsDeleted))
            .FirstOrDefaultAsync(d => d.Id == id, ct);

    public async Task<IEnumerable<AppleDevice>> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        await _db.AppleDevices
            .Include(d => d.CatalogDevice)
            .Include(d => d.CycleRecords.Where(r => !r.IsDeleted))
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync(ct);

    public async Task<IEnumerable<DeviceCatalog>> GetCatalogAsync(CancellationToken ct = default) =>
        await _db.DeviceCatalog
            .OrderBy(c => c.SortOrder)
            .ToListAsync(ct);

    public async Task<DeviceCatalog?> GetCatalogItemAsync(Guid id, CancellationToken ct = default) =>
        await _db.DeviceCatalog.FindAsync([id], ct);

    public async Task AddCatalogAsync(DeviceCatalog item, CancellationToken ct = default) =>
        await _db.DeviceCatalog.AddAsync(item, ct);

    public Task DeleteCatalogAsync(DeviceCatalog item, CancellationToken ct = default)
    {
        _db.DeviceCatalog.Remove(item);
        return Task.CompletedTask;
    }

    public async Task AddAsync(AppleDevice device, CancellationToken ct = default) =>
        await _db.AppleDevices.AddAsync(device, ct);

    public Task UpdateAsync(AppleDevice device, CancellationToken ct = default)
    {
        if (_db.Entry(device).State == Microsoft.EntityFrameworkCore.EntityState.Detached)
            _db.AppleDevices.Update(device);
        return Task.CompletedTask;
    }

    public async Task AddCycleRecordAsync(BatteryCycleRecord record, CancellationToken ct = default) =>
        await _db.BatteryCycleRecords.AddAsync(record, ct);

    public async Task<BatteryCycleRecord?> GetCycleRecordAsync(Guid recordId, CancellationToken ct = default) =>
        await _db.BatteryCycleRecords.FindAsync([recordId], ct);

    public Task DeleteCycleRecordAsync(BatteryCycleRecord record, CancellationToken ct = default)
    {
        _db.BatteryCycleRecords.Remove(record);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(Guid id, Guid userId, CancellationToken ct = default) =>
        await _db.AppleDevices.AnyAsync(d => d.Id == id && d.UserId == userId, ct);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        await _db.SaveChangesAsync(ct);
}
