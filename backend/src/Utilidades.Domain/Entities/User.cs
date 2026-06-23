using Utilidades.Domain.Common;
using Utilidades.Domain.Enums;
using Utilidades.Domain.Events;

namespace Utilidades.Domain.Entities;

public sealed class User : BaseEntity
{
    private User() { }

    public string FirstName { get; private set; } = default!;
    public string LastName { get; private set; } = default!;
    public string Email { get; private set; } = default!;
    public string PasswordHash { get; private set; } = default!;
    public UserRole Role { get; private set; }
    public bool IsActive { get; private set; }
    public DateTime? LastLoginAt { get; private set; }
    public string? MfaSecret { get; private set; }
    public bool MfaEnabled { get; private set; }

    private readonly List<RefreshToken> _refreshTokens = [];
    public IReadOnlyList<RefreshToken> RefreshTokens => _refreshTokens.AsReadOnly();

    private readonly List<Vehicle> _vehicles = [];
    public IReadOnlyList<Vehicle> Vehicles => _vehicles.AsReadOnly();

    private readonly List<AppleDevice> _appleDevices = [];
    public IReadOnlyList<AppleDevice> AppleDevices => _appleDevices.AsReadOnly();

    public string FullName => $"{FirstName} {LastName}";

    public static User Create(string firstName, string lastName, string email, string passwordHash, UserRole role = UserRole.User)
    {
        var user = new User
        {
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Email = email.Trim().ToLowerInvariant(),
            PasswordHash = passwordHash,
            Role = role,
            IsActive = true
        };

        user.AddDomainEvent(new UserCreatedEvent(user.Id, user.Email, user.FullName));
        return user;
    }

    public void UpdateProfile(string firstName, string lastName)
    {
        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        UpdatedAt = DateTime.UtcNow;
    }

    public void RecordLogin()
    {
        LastLoginAt = DateTime.UtcNow;
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

    public void ChangePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        UpdatedAt = DateTime.UtcNow;
        RevokeAllRefreshTokens("Password changed");
    }

    public RefreshToken AddRefreshToken(string token, string jwtId, DateTime expiryDate, string createdByIp)
    {
        var refreshToken = RefreshToken.Create(Id, token, jwtId, expiryDate, createdByIp);
        _refreshTokens.Add(refreshToken);
        return refreshToken;
    }

    public void RevokeRefreshToken(string token, string revokedByIp, string? replacedByToken = null)
    {
        var refreshToken = _refreshTokens.FirstOrDefault(t => t.Token == token)
            ?? throw new InvalidOperationException($"Refresh token not found.");

        refreshToken.Revoke(revokedByIp, replacedByToken);
    }

    public void RevokeAllRefreshTokens(string reason)
    {
        foreach (var token in _refreshTokens.Where(t => t.IsActive))
        {
            token.Revoke("system", reason: reason);
        }
    }

    public void RemoveExpiredTokens()
    {
        _refreshTokens.RemoveAll(t => !t.IsActive && t.CreatedAt.AddDays(7) < DateTime.UtcNow);
    }
}
