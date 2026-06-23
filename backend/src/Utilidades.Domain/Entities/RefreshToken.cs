using Utilidades.Domain.Common;

namespace Utilidades.Domain.Entities;

public sealed class RefreshToken : BaseEntity
{
    private RefreshToken() { }

    public Guid UserId { get; private set; }
    public string Token { get; private set; } = default!;
    public string JwtId { get; private set; } = default!;
    public DateTime ExpiryDate { get; private set; }
    public bool IsRevoked { get; private set; }
    public string? RevokedByIp { get; private set; }
    public DateTime? RevokedAt { get; private set; }
    public string? ReplacedByToken { get; private set; }
    public string? RevokeReason { get; private set; }
    public string CreatedByIp { get; private set; } = default!;

    public bool IsExpired => DateTime.UtcNow >= ExpiryDate;
    public bool IsActive => !IsRevoked && !IsExpired;

    public User User { get; private set; } = default!;

    public static RefreshToken Create(Guid userId, string token, string jwtId, DateTime expiryDate, string createdByIp)
    {
        return new RefreshToken
        {
            UserId = userId,
            Token = token,
            JwtId = jwtId,
            ExpiryDate = expiryDate,
            CreatedByIp = createdByIp,
            IsRevoked = false
        };
    }

    public void Revoke(string revokedByIp, string? replacedByToken = null, string? reason = null)
    {
        IsRevoked = true;
        RevokedByIp = revokedByIp;
        RevokedAt = DateTime.UtcNow;
        ReplacedByToken = replacedByToken;
        RevokeReason = reason;
    }
}
