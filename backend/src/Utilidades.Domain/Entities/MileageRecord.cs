using Utilidades.Domain.Common;

namespace Utilidades.Domain.Entities;

public sealed class MileageRecord : BaseEntity
{
    private MileageRecord() { }

    public Guid VehicleId { get; private set; }
    public DateOnly RecordDate { get; private set; }
    public decimal CurrentMileage { get; private set; }
    public string? Observations { get; private set; }

    public Vehicle Vehicle { get; private set; } = default!;

    public static MileageRecord Create(
        Guid vehicleId,
        DateOnly recordDate,
        decimal currentMileage,
        string? observations = null)
    {
        return new MileageRecord
        {
            VehicleId = vehicleId,
            RecordDate = recordDate,
            CurrentMileage = currentMileage,
            Observations = observations?.Trim()
        };
    }

    public void Update(DateOnly recordDate, decimal currentMileage, string? observations)
    {
        RecordDate = recordDate;
        CurrentMileage = currentMileage;
        Observations = observations?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }
}
