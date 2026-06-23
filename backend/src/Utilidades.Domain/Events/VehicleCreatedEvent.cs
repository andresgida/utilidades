using Utilidades.Domain.Common;

namespace Utilidades.Domain.Events;

public sealed class VehicleCreatedEvent : BaseDomainEvent
{
    public VehicleCreatedEvent(Guid vehicleId, Guid userId, string vehicleName)
    {
        VehicleId = vehicleId;
        UserId = userId;
        VehicleName = vehicleName;
    }

    public Guid VehicleId { get; }
    public Guid UserId { get; }
    public string VehicleName { get; }
    public override string EventType => "vehicle.created";
}

public sealed class MileageRecordedEvent : BaseDomainEvent
{
    public MileageRecordedEvent(Guid vehicleId, Guid userId, Guid recordId, decimal currentMileage)
    {
        VehicleId = vehicleId;
        UserId = userId;
        RecordId = recordId;
        CurrentMileage = currentMileage;
    }

    public Guid VehicleId { get; }
    public Guid UserId { get; }
    public Guid RecordId { get; }
    public decimal CurrentMileage { get; }
    public override string EventType => "vehicle.mileage_recorded";
}
