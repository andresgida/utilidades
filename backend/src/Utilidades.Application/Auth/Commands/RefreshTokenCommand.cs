using MediatR;
using Utilidades.Application.DTOs.Auth;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Auth.Commands;

public record RefreshTokenCommand(string RefreshToken, string IpAddress) : IRequest<AuthResponseDto>;

public sealed class RefreshTokenCommandHandler : IRequestHandler<RefreshTokenCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuditService _auditService;

    public RefreshTokenCommandHandler(
        IUserRepository userRepository,
        IJwtTokenService jwtTokenService,
        IAuditService auditService)
    {
        _userRepository = userRepository;
        _jwtTokenService = jwtTokenService;
        _auditService = auditService;
    }

    public async Task<AuthResponseDto> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByRefreshTokenAsync(request.RefreshToken, ct);
        var existingToken = user?.RefreshTokens.FirstOrDefault(t => t.Token == request.RefreshToken);

        if (user == null || existingToken == null)
            throw new UnauthorizedAccessException("Invalid refresh token.");

        if (!existingToken.IsActive)
        {
            if (existingToken.IsRevoked)
            {
                user.RevokeAllRefreshTokens("Token reuse detected - security breach");
                await _userRepository.SaveChangesAsync(ct);
                await _auditService.LogSecurityEventAsync(
                    "token.reuse_detected", user.Id.ToString(), request.IpAddress,
                    "Refresh token reuse detected. All tokens revoked.", ct);
            }
            throw new UnauthorizedAccessException("Refresh token is no longer active.");
        }

        var newAccessToken = _jwtTokenService.GenerateAccessToken(user);
        var (newRefreshTokenValue, newJwtId) = _jwtTokenService.GenerateRefreshToken();
        var newExpiry = DateTime.UtcNow.AddDays(7);

        user.RevokeRefreshToken(request.RefreshToken, request.IpAddress, newRefreshTokenValue);
        user.AddRefreshToken(newRefreshTokenValue, newJwtId, newExpiry, request.IpAddress);
        user.RemoveExpiredTokens();

        await _userRepository.UpdateAsync(user, ct);
        await _userRepository.SaveChangesAsync(ct);

        return new AuthResponseDto(
            newAccessToken,
            newRefreshTokenValue,
            DateTime.UtcNow.AddMinutes(15),
            new UserInfoDto(user.Id, user.FirstName, user.LastName, user.Email,
                user.FullName, user.Role.ToString(), user.LastLoginAt));
    }
}
