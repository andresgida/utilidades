namespace Utilidades.Application.DTOs.Auth;

public record LoginRequestDto(string Email, string Password);

public record RegisterRequestDto(
    string FirstName,
    string LastName,
    string Email,
    string Password,
    string ConfirmPassword);

public record AuthResponseDto(
    string AccessToken,
    string RefreshToken,
    DateTime AccessTokenExpiry,
    UserInfoDto User);

public record RefreshTokenRequestDto(string RefreshToken);

public record RevokeTokenRequestDto(string RefreshToken);

public record UserInfoDto(
    Guid Id,
    string FirstName,
    string LastName,
    string Email,
    string FullName,
    string Role,
    DateTime? LastLoginAt);

public record ChangePasswordDto(
    string CurrentPassword,
    string NewPassword,
    string ConfirmNewPassword);
