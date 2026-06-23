using MediatR;
using Utilidades.Application.DTOs.Auth;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Auth.Commands;

public record LoginCommand(string Email, string Password, string IpAddress) : IRequest<AuthResponseDto>;

public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuditService _auditService;

    public LoginCommandHandler(
        IUserRepository userRepository,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService,
        IAuditService auditService)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _auditService = auditService;
    }

    public async Task<AuthResponseDto> Handle(LoginCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email, ct)
            ?? throw new UnauthorizedAccessException("Invalid credentials.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            await _auditService.LogSecurityEventAsync(
                "login.failed", null, request.IpAddress,
                $"Failed login attempt for email: {request.Email}", ct);
            throw new UnauthorizedAccessException("Invalid credentials.");
        }

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var (refreshTokenValue, jwtId) = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        var loadedUser = await _userRepository.GetByIdWithTokensAsync(user.Id, ct) ?? user;
        var refreshToken = loadedUser.AddRefreshToken(refreshTokenValue, jwtId, refreshTokenExpiry, request.IpAddress);
        loadedUser.RecordLogin();

        await _userRepository.AddRefreshTokenAsync(refreshToken, ct);
        await _userRepository.UpdateAsync(loadedUser, ct);
        await _userRepository.SaveChangesAsync(ct);

        await _auditService.LogSecurityEventAsync(
            "login.success", user.Id.ToString(), request.IpAddress,
            $"User {user.Email} logged in", ct);

        return new AuthResponseDto(
            accessToken,
            refreshTokenValue,
            DateTime.UtcNow.AddMinutes(15),
            new UserInfoDto(user.Id, user.FirstName, user.LastName, user.Email,
                user.FullName, user.Role.ToString(), user.LastLoginAt));
    }
}
