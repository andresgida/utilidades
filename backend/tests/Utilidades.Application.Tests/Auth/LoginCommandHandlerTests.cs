using FluentAssertions;
using NSubstitute;
using Utilidades.Application.Auth.Commands;
using Utilidades.Application.Interfaces;
using Utilidades.Domain.Entities;
using Utilidades.Domain.Enums;
using Utilidades.Domain.Interfaces;
using Xunit;

namespace Utilidades.Application.Tests.Auth;

public class LoginCommandHandlerTests
{
    private readonly IUserRepository _userRepository = Substitute.For<IUserRepository>();
    private readonly IPasswordHasher _passwordHasher = Substitute.For<IPasswordHasher>();
    private readonly IJwtTokenService _jwtTokenService = Substitute.For<IJwtTokenService>();
    private readonly IAuditService _auditService = Substitute.For<IAuditService>();

    private LoginCommandHandler CreateHandler() =>
        new(_userRepository, _passwordHasher, _jwtTokenService, _auditService);

    [Fact]
    public async Task Handle_WithValidCredentials_ShouldReturnAuthResponse()
    {
        var user = User.Create("John", "Doe", "john@example.com", "hashed_pw", UserRole.User);

        _userRepository.GetByEmailAsync("john@example.com", default)
            .Returns(user);
        _userRepository.GetByIdWithTokensAsync(user.Id, default)
            .Returns(user);
        _passwordHasher.Verify("password123", "hashed_pw").Returns(true);
        _jwtTokenService.GenerateAccessToken(user).Returns("access_token_value");
        _jwtTokenService.GenerateRefreshToken().Returns(("refresh_token_value", "jwt_id"));

        var handler = CreateHandler();
        var result = await handler.Handle(
            new LoginCommand("john@example.com", "password123", "127.0.0.1"),
            CancellationToken.None);

        result.Should().NotBeNull();
        result.AccessToken.Should().Be("access_token_value");
        result.RefreshToken.Should().Be("refresh_token_value");
        result.User.Email.Should().Be("john@example.com");
    }

    [Fact]
    public async Task Handle_WithInvalidPassword_ShouldThrowUnauthorized()
    {
        var user = User.Create("John", "Doe", "john@example.com", "hashed_pw");

        _userRepository.GetByEmailAsync("john@example.com", default).Returns(user);
        _passwordHasher.Verify("wrong_password", "hashed_pw").Returns(false);

        var handler = CreateHandler();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(
                new LoginCommand("john@example.com", "wrong_password", "127.0.0.1"),
                CancellationToken.None));
    }

    [Fact]
    public async Task Handle_WithNonExistentEmail_ShouldThrowUnauthorized()
    {
        _userRepository.GetByEmailAsync(Arg.Any<string>(), default).Returns((User?)null);

        var handler = CreateHandler();

        await Assert.ThrowsAsync<UnauthorizedAccessException>(() =>
            handler.Handle(
                new LoginCommand("noexist@example.com", "password", "127.0.0.1"),
                CancellationToken.None));
    }
}
