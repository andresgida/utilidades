using MediatR;
using Utilidades.Application.DTOs.Auth;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Enums;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Auth.Commands;

public record RegisterCommand(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string IpAddress) : IRequest<AuthResponseDto>;

public sealed class RegisterCommandHandler : IRequestHandler<RegisterCommand, AuthResponseDto>
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IAuditService _auditService;

    public RegisterCommandHandler(
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

    public async Task<AuthResponseDto> Handle(RegisterCommand request, CancellationToken ct)
    {
        var emailExists = await _userRepository.ExistsByEmailAsync(request.Email, ct);
        if (emailExists)
            throw new InvalidOperationException($"Email '{request.Email}' is already registered.");

        var passwordHash = _passwordHasher.Hash(request.Password);
        var user = User.Create(request.FirstName, request.LastName, request.Email, passwordHash, UserRole.User);

        await _userRepository.AddAsync(user, ct);

        var accessToken = _jwtTokenService.GenerateAccessToken(user);
        var (refreshTokenValue, jwtId) = _jwtTokenService.GenerateRefreshToken();
        var refreshTokenExpiry = DateTime.UtcNow.AddDays(7);

        user.AddRefreshToken(refreshTokenValue, jwtId, refreshTokenExpiry, request.IpAddress);

        await _userRepository.SaveChangesAsync(ct);

        await _auditService.LogSecurityEventAsync(
            "register.success", user.Id.ToString(), request.IpAddress,
            $"New user registered: {user.Email}", ct);

        return new AuthResponseDto(
            accessToken,
            refreshTokenValue,
            DateTime.UtcNow.AddMinutes(15),
            new UserInfoDto(user.Id, user.FirstName, user.LastName, user.Email,
                user.FullName, user.Role.ToString(), null));
    }
}
