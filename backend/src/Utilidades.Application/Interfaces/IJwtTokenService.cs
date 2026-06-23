using Utilidades.Domain.Entities;

namespace Utilidades.Application.Interfaces;

public interface IJwtTokenService
{
    string GenerateAccessToken(User user);
    (string token, string jwtId) GenerateRefreshToken();
    bool ValidateRefreshToken(string token, string jwtId);
    Guid? GetUserIdFromExpiredToken(string accessToken);
}
