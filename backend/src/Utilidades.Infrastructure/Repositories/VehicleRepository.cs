using Microsoft.EntityFrameworkCore;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Interfaces;
using Utilidades.Infrastructure.Persistence;

namespace Utilidades.Infrastructure.Repositories;

public class VehicleRepository : IVehicleRepository
{
    private readonly ApplicationDbContext _db;

    public VehicleRepository(ApplicationDbContext db) => _db = db;

    public async Task<Vehicle?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        await _db.Vehicles.FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<Vehicle?> GetByIdWithRecordsAsync(Guid id, CancellationToken ct = default) =>
        await _db.Vehicles
            .Include(v => v.MileageRecords.Where(r => !r.IsDeleted))
            .FirstOrDefaultAsync(v => v.Id == id, ct);

    public async Task<IEnumerable<Vehicle>> GetByUserIdAsync(Guid userId, CancellationToken ct = default) =>
        await _db.Vehicles
            .Include(v => v.MileageRecords.Where(r => !r.IsDeleted))
            .Where(v => v.UserId == userId)
            .OrderByDescending(v => v.CreatedAt)
            .ToListAsync(ct);

    public async Task AddAsync(Vehicle vehicle, CancellationToken ct = default) =>
        await _db.Vehicles.AddAsync(vehicle, ct);

    public Task UpdateAsync(Vehicle vehicle, CancellationToken ct = default)
    {
        if (_db.Entry(vehicle).State == Microsoft.EntityFrameworkCore.EntityState.Detached)
            _db.Vehicles.Update(vehicle);
        return Task.CompletedTask;
    }

    public async Task AddMileageRecordAsync(MileageRecord record, CancellationToken ct = default) =>
        await _db.MileageRecords.AddAsync(record, ct);

    public async Task<MileageRecord?> GetMileageRecordAsync(Guid recordId, CancellationToken ct = default) =>
        await _db.MileageRecords.FindAsync([recordId], ct);

    public Task DeleteMileageRecordAsync(MileageRecord record, CancellationToken ct = default)
    {
        _db.MileageRecords.Remove(record);
        return Task.CompletedTask;
    }

    public async Task<bool> ExistsAsync(Guid id, Guid userId, CancellationToken ct = default) =>
        await _db.Vehicles.AnyAsync(v => v.Id == id && v.UserId == userId, ct);

    public async Task<int> SaveChangesAsync(CancellationToken ct = default) =>
        await _db.SaveChangesAsync(ct);
}
