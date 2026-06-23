using Utilidades.Domain.Common;

namespace Utilidades.Domain.Events;

public sealed class AppleDeviceCreatedEvent : BaseDomainEvent
{
    public AppleDeviceCreatedEvent(Guid deviceId, Guid userId, string deviceName)
    {
        DeviceId = deviceId;
        UserId = userId;
        DeviceName = deviceName;
    }

    public Guid DeviceId { get; }
    public Guid UserId { get; }
    public string DeviceName { get; }
    public override string EventType => "apple_device.created";
}

public sealed class CycleRecordedEvent : BaseDomainEvent
{
    public CycleRecordedEvent(Guid deviceId, Guid userId, Guid recordId, int currentCycles)
    {
        DeviceId = deviceId;
        UserId = userId;
        RecordId = recordId;
        CurrentCycles = currentCycles;
    }

    public Guid DeviceId { get; }
    public Guid UserId { get; }
    public Guid RecordId { get; }
    public int CurrentCycles { get; }
    public override string EventType => "apple_device.cycle_recorded";
}
