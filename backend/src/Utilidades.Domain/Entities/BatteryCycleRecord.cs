using Utilidades.Domain.Common;

namespace Utilidades.Domain.Entities;

public sealed class BatteryCycleRecord : BaseEntity
{
    private BatteryCycleRecord() { }

    public Guid AppleDeviceId { get; private set; }
    public DateOnly RecordDate { get; private set; }
    public int CurrentCycles { get; private set; }
    public string? Notes { get; private set; }

    public AppleDevice AppleDevice { get; private set; } = default!;

    public static BatteryCycleRecord Create(
        Guid appleDeviceId,
        DateOnly recordDate,
        int currentCycles,
        string? notes = null)
    {
        return new BatteryCycleRecord
        {
            AppleDeviceId = appleDeviceId,
            RecordDate = recordDate,
            CurrentCycles = currentCycles,
            Notes = notes?.Trim()
        };
    }

    public void Update(DateOnly recordDate, int currentCycles, string? notes)
    {
        RecordDate = recordDate;
        CurrentCycles = currentCycles;
        Notes = notes?.Trim();
        UpdatedAt = DateTime.UtcNow;
    }
}
