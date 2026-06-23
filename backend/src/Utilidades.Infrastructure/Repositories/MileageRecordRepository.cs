using Microsoft.EntityFrameworkCore;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;
using Utilidades.Infrastructure.Persistence;

namespace Utilidades.Infrastructure.Repositories;

public class MileageRecordRepository : IMileageRecordRepository
{
    private readonly ApplicationDbContext _db;

    public MileageRecordRepository(ApplicationDbContext db) => _db = db;

    public async Task<MileageRecord?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.MileageRecords.FirstOrDefaultAsync(r => r.Id == id, ct);

    public async Task<IEnumerable<MileageRecord>> GetByVehicleIdAsync(Guid vehicleId, CancellationToken ct = default) =>
        await _db.MileageRecords
            .Where(r => r.VehicleId == vehicleId)
            .OrderByDescending(r => r.RecordDate)
            .ToListAsync(ct);

    public async Task AddAsync(MileageRecord record, CancellationToken ct = default) =>
        await _db.MileageRecords.AddAsync(record, ct);

    public Task UpdateAsync(MileageRecord record, CancellationToken ct = default)
    {
        _db.MileageRecords.Update(record);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(Guid id, Guid vehicleId, CancellationToken ct = default) =>
        await _db.MileageRecords.AnyAsync(r => r.Id == id && r.VehicleId == vehicleId, ct);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        await _db.SaveChangesAsync(ct);
}
