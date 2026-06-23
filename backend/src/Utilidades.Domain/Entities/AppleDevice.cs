using Utilidades.Domain.Common;
using Utilidades.Domain.Events;

namespace Utilidades.Domain.Entities;

public sealed class AppleDevice : BaseEntity
{
    private AppleDevice() { }

    public Guid UserId { get; private set; }
    public string DeviceName { get; private set; } = default!;
    public Guid? CatalogDeviceId { get; private set; }
    public DateOnly PurchaseDate { get; private set; }
    public bool IsCustomDevice { get; private set; }

    public User User { get; private set; } = default!;
    public DeviceCatalog? CatalogDevice { get; private set; }

    private readonly List<BatteryCycleRecord> _cycleRecords = [];
    public IReadOnlyList<BatteryCycleRecord> CycleRecords => _cycleRecords.AsReadOnly();

    public static AppleDevice Create(
        Guid userId,
        string deviceName,
        DateOnly purchaseDate,
        Guid? catalogDeviceId = null,
        bool isCustomDevice = false)
    {
        var device = new AppleDevice
        {
            UserId = userId,
            DeviceName = deviceName.Trim(),
            PurchaseDate = purchaseDate,
            CatalogDeviceId = catalogDeviceId,
            IsCustomDevice = isCustomDevice
        };

        device.AddDomainEvent(new AppleDeviceCreatedEvent(device.Id, device.UserId, device.DeviceName));
        return device;
    }

    public void Update(string deviceName, DateOnly purchaseDate)
    {
        DeviceName = deviceName.Trim();
        PurchaseDate = purchaseDate;
        UpdatedAt = DateTime.UtcNow;
    }

    public BatteryCycleRecord AddCycleRecord(DateOnly recordDate, int currentCycles, string? notes = null)
    {
        var record = BatteryCycleRecord.Create(Id, recordDate, currentCycles, notes);
        _cycleRecords.Add(record);
        AddDomainEvent(new CycleRecordedEvent(Id, UserId, record.Id, currentCycles));
        return record;
    }

    public DeviceStatistics CalculateStatistics()
    {
        if (!_cycleRecords.Any())
            return DeviceStatistics.Empty(Id);

        var latestRecord = _cycleRecords.OrderByDescending(r => r.RecordDate).First();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var daysElapsed = today.DayNumber - PurchaseDate.DayNumber;
        var dailyAverage = daysElapsed > 0 ? (decimal)latestRecord.CurrentCycles / daysElapsed : 0;
        var annualProjection = dailyAverage * 365;

        // Battery health model:
        //   Phase 1 (0 → maxCycles/2): 100% — early cycles cause negligible real degradation
        //   Phase 2 (maxCycles/2 → maxCycles): linear 100% → 80%
        //   Beyond maxCycles: continues below 80%
        var maxCycles = (decimal)(CatalogDevice?.MaxCycles ?? 1000);
        var midpoint  = maxCycles / 2m;
        var degradation = latestRecord.CurrentCycles <= midpoint
            ? 0m
            : (latestRecord.CurrentCycles - midpoint) / midpoint * 20m;
        var healthPercentage = Math.Max(0m, 100m - degradation);

        return new DeviceStatistics(
            Id,
            daysElapsed,
            latestRecord.CurrentCycles,
            dailyAverage,
            annualProjection,
            healthPercentage);
    }
}

public record DeviceStatistics(
    Guid DeviceId,
    int DaysElapsed,
    int CurrentCycles,
    decimal DailyAverage,
    decimal AnnualProjection,
    decimal HealthPercentage)
{
    public static DeviceStatistics Empty(Guid deviceId) =>
        new(deviceId, 0, 0, 0, 0, 100);

    public string HealthStatus => HealthPercentage switch
    {
        >= 90 => "Excellent",
        >= 80 => "Good",
        >= 60 => "Fair",
        >= 40 => "Poor",
        _ => "Critical"
    };
}
