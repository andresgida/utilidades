using Utilidades.Domain.Common;
using Utilidades.Domain.Events;

namespace Utilidades.Domain.Entities;

public sealed class Vehicle : BaseEntity
{
    private Vehicle() { }

    public Guid UserId { get; private set; }
    public string Name { get; private set; } = default!;
    public string Brand { get; private set; } = default!;
    public string Model { get; private set; } = default!;
    public int Year { get; private set; }
    public string? LicensePlate { get; private set; }
    public DateOnly StartCountDate { get; private set; }
    public decimal BaseMileage { get; private set; }
    public bool IsActive { get; private set; }

    public User User { get; private set; } = default!;

    private readonly List<MileageRecord> _mileageRecords = [];
    public IReadOnlyList<MileageRecord> MileageRecords => _mileageRecords.AsReadOnly();

    public static Vehicle Create(
        Guid userId,
        string name,
        string brand,
        string model,
        int year,
        DateOnly startCountDate,
        decimal baseMileage,
        string? licensePlate = null)
    {
        var vehicle = new Vehicle
        {
            UserId = userId,
            Name = name.Trim(),
            Brand = brand.Trim(),
            Model = model.Trim(),
            Year = year,
            LicensePlate = licensePlate?.Trim().ToUpperInvariant(),
            StartCountDate = startCountDate,
            BaseMileage = baseMileage,
            IsActive = true
        };

        vehicle.AddDomainEvent(new VehicleCreatedEvent(vehicle.Id, vehicle.UserId, vehicle.Name));
        return vehicle;
    }

    public void Update(string name, string brand, string model, int year, string? licensePlate, DateOnly startCountDate, decimal baseMileage)
    {
        Name = name.Trim();
        Brand = brand.Trim();
        Model = model.Trim();
        Year = year;
        LicensePlate = licensePlate?.Trim().ToUpperInvariant();
        StartCountDate = startCountDate;
        BaseMileage = baseMileage;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Activate()
    {
        IsActive = true;
        UpdatedAt = DateTime.UtcNow;
    }

    public MileageRecord AddMileageRecord(DateOnly recordDate, decimal currentMileage, string? observations = null)
    {
        var record = MileageRecord.Create(Id, recordDate, currentMileage, observations);
        _mileageRecords.Add(record);
        AddDomainEvent(new MileageRecordedEvent(Id, UserId, record.Id, currentMileage));
        return record;
    }

    public VehicleStatistics CalculateStatistics()
    {
        if (!_mileageRecords.Any())
            return VehicleStatistics.Empty(Id);

        var latestRecord = _mileageRecords.OrderByDescending(r => r.RecordDate).First();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var daysElapsed = today.DayNumber - StartCountDate.DayNumber;
        var kmTraveled = latestRecord.CurrentMileage - BaseMileage;
        var dailyAverage = daysElapsed > 0 ? kmTraveled / daysElapsed : 0;
        var annualProjection = dailyAverage * 365;

        return new VehicleStatistics(Id, daysElapsed, kmTraveled, dailyAverage, annualProjection, latestRecord.CurrentMileage);
    }
}

public record VehicleStatistics(
    Guid VehicleId,
    int DaysElapsed,
    decimal KmTraveled,
    decimal DailyAverage,
    decimal AnnualProjection,
    decimal CurrentMileage)
{
    public static VehicleStatistics Empty(Guid vehicleId) =>
        new(vehicleId, 0, 0, 0, 0, 0);
}
