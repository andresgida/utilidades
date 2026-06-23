using MediatR;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Interfaces;

namespace Utilidades.Application.Auth.Commands;

public record RevokeTokenCommand(string RefreshToken, string IpAddress) : IRequest<bool>;

public sealed class RevokeTokenCommandHandler : IRequestHandler<RevokeTokenCommand, bool>
{
    private readonly IUserRepository _userRepository;
    private readonly IAuditService _auditService;

    public RevokeTokenCommandHandler(IUserRepository userRepository, IAuditService auditService)
    {
        _userRepository = userRepository;
        _auditService = auditService;
    }

    public async Task<bool> Handle(RevokeTokenCommand request, CancellationToken ct)
    {
        var allUsers = await _userRepository.GetAllAsync(ct);

        foreach (var u in allUsers)
        {
            var loaded = await _userRepository.GetByIdWithTokensAsync(u.Id, ct);
            var token = loaded?.RefreshTokens.FirstOrDefault(t => t.Token == request.RefreshToken);
            if (token != null && loaded != null)
            {
                loaded.RevokeRefreshToken(request.RefreshToken, request.IpAddress);
                await _userRepository.UpdateAsync(loaded, ct);
                await _userRepository.SaveChangesAsync(ct);
                await _auditService.LogSecurityEventAsync(
                    "token.revoked", loaded.Id.ToString(), request.IpAddress, "Token manually revoked", ct);
                return true;
            }
        }

        return false;
    }
}
