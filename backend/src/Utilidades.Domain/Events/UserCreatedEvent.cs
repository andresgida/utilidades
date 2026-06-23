using Utilidades.Domain.Common;

namespace Utilidades.Domain.Events;

public sealed class UserCreatedEvent : BaseDomainEvent
{
    public UserCreatedEvent(Guid userId, string email, string fullName)
    {
        UserId = userId;
        Email = email;
        FullName = fullName;
    }

    public Guid UserId { get; }
    public string Email { get; }
    public string FullName { get; }
    public override string EventType => "user.created";
}
