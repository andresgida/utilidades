using FluentAssertions;
using Utilidades.Domain.Entities;
using Xunit;

namespace Utilidades.Domain.Tests.Entities;

public class VehicleTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateVehicle()
    {
        var start = new DateOnly(2024, 1, 1);
        var vehicle = Vehicle.Create(UserId, "My Car", "Toyota", "Corolla", 2022, start, 10000);

        vehicle.Name.Should().Be("My Car");
        vehicle.Brand.Should().Be("Toyota");
        vehicle.BaseMileage.Should().Be(10000);
        vehicle.IsActive.Should().BeTrue();
        vehicle.UserId.Should().Be(UserId);
        vehicle.DomainEvents.Should().ContainSingle(e => e.EventType == "vehicle.created");
    }

    [Fact]
    public void AddMileageRecord_ShouldAddRecord()
    {
        var vehicle = Vehicle.Create(UserId, "Car", "Ford", "Focus", 2023, new DateOnly(2024, 1, 1), 0);
        var date = new DateOnly(2024, 6, 1);

        vehicle.AddMileageRecord(date, 5000, "First record");

        vehicle.MileageRecords.Should().HaveCount(1);
        vehicle.MileageRecords[0].CurrentMileage.Should().Be(5000);
    }

    [Fact]
    public void CalculateStatistics_WithRecords_ShouldReturnCorrectValues()
    {
        var startDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-100));
        var vehicle = Vehicle.Create(UserId, "Car", "Ford", "Focus", 2023, startDate, 10000);
        var recordDate = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));

        vehicle.AddMileageRecord(recordDate, 12000);

        var stats = vehicle.CalculateStatistics();

        stats.KmTraveled.Should().Be(2000);
        stats.DaysElapsed.Should().BeGreaterThan(90);
        stats.DailyAverage.Should().BeGreaterThan(0);
        stats.AnnualProjection.Should().BeGreaterThan(0);
    }

    [Fact]
    public void SoftDelete_ShouldMarkAsDeleted()
    {
        var vehicle = Vehicle.Create(UserId, "Car", "Ford", "Focus", 2023, new DateOnly(2024, 1, 1), 0);
        vehicle.SoftDelete("admin");

        vehicle.IsDeleted.Should().BeTrue();
        vehicle.DeletedBy.Should().Be("admin");
        vehicle.DeletedAt.Should().NotBeNull();
    }
}
