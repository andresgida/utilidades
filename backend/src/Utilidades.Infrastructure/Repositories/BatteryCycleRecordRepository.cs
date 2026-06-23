using Microsoft.EntityFrameworkCore;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;
using Utilidades.Infrastructure.Persistence;

namespace Utilidades.Infrastructure.Repositories;

public class BatteryCycleRecordRepository : IBatteryCycleRecordRepository
{
    private readonly ApplicationDbContext _db;

    public BatteryCycleRecordRepository(ApplicationDbContext db) => _db = db;

    public async Task<BatteryCycleRecord?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.BatteryCycleRecords.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<BatteryCycleRecord>> GetByDeviceIdAsync(Guid deviceId, CancellationToken ct = default) =>
        await _db.BatteryCycleRecords
            .Where(r => r.AppleDeviceId == deviceId)
            .OrderByDescending(r => r.RecordDate)
            .ToListAsync(ct);

    public async Task AddAsync(BatteryCycleRecord record, CancellationToken ct = default) =>
        await _db.BatteryCycleRecords.AddAsync(record, ct);

    public Task UpdateAsync(BatteryCycleRecord record, CancellationToken ct = default)
    {
        _db.BatteryCycleRecords.Update(record);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(Guid id, Guid deviceId, CancellationToken ct = default) =>
        await _db.BatteryCycleRecords.AnyAsync(r => r.Id == id && r.AppleDeviceId == deviceId, ct);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        await _db.SaveChangesAsync(ct);
}
