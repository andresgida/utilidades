using FluentAssertions;
using Utilidades.Domain.Entities;
using Xunit;

namespace Utilidades.Domain.Tests.Entities;

public class AppleDeviceTests
{
    private static readonly Guid UserId = Guid.NewGuid();

    [Fact]
    public void Create_WithValidData_ShouldCreateDevice()
    {
        var purchaseDate = new DateOnly(2023, 9, 15);
        var device = AppleDevice.Create(UserId, "My iPhone 15 Pro", purchaseDate);

        device.DeviceName.Should().Be("My iPhone 15 Pro");
        device.PurchaseDate.Should().Be(purchaseDate);
        device.IsCustomDevice.Should().BeFalse();
        device.DomainEvents.Should().ContainSingle(e => e.EventType == "apple_device.created");
    }

    [Fact]
    public void AddCycleRecord_ShouldCalculateHealthCorrectly()
    {
        var device = AppleDevice.Create(UserId, "iPhone 15", new DateOnly(2023, 9, 1));
        device.AddCycleRecord(DateOnly.FromDateTime(DateTime.UtcNow), 200);

        var stats = device.CalculateStatistics();

        stats.CurrentCycles.Should().Be(200);
        // 200 cycles = 200/1000 * 20 = 4% degradation → 96% health
        stats.HealthPercentage.Should().BeApproximately(96m, 0.1m);
        stats.HealthStatus.Should().Be("Excellent");
    }

    [Fact]
    public void HealthStatus_At1000Cycles_ShouldBePoor()
    {
        var device = AppleDevice.Create(UserId, "iPhone 15", new DateOnly(2020, 9, 1));
        device.AddCycleRecord(DateOnly.FromDateTime(DateTime.UtcNow), 1000);

        var stats = device.CalculateStatistics();

        stats.HealthPercentage.Should().BeApproximately(80m, 0.1m);
        stats.HealthStatus.Should().Be("Good");
    }

    [Theory]
    [InlineData(200, "Excellent")]
    [InlineData(600, "Good")]
    [InlineData(900, "Fair")]
    [InlineData(1500, "Poor")]
    [InlineData(2000, "Critical")]
    public void HealthStatus_ShouldReflectCycleCount(int cycles, string expectedStatus)
    {
        var device = AppleDevice.Create(UserId, "iPhone", new DateOnly(2019, 1, 1));
        device.AddCycleRecord(DateOnly.FromDateTime(DateTime.UtcNow), cycles);

        var stats = device.CalculateStatistics();

        stats.HealthStatus.Should().Be(expectedStatus);
    }
}
