using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Utilidades.Application.Auth.Commands;
using Utilidades.Application.DTOs.Auth;

namespace Utilidades.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Produces("application/json")]
public class AuthController : ControllerBase
{
    private readonly IMediator _mediator;

    public AuthController(IMediator mediator) => _mediator = mediator;

    private string ClientIp => HttpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    /// <summary>Authenticate user and obtain JWT tokens.</summary>
    [HttpPost("login")]
    [EnableRateLimiting("auth")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(401)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new LoginCommand(dto.Email, dto.Password, ClientIp), ct);

        return Ok(result);
    }

    /// <summary>Register a new user account.</summary>
    [HttpPost("register")]
    [EnableRateLimiting("auth")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), 201)]
    [ProducesResponseType(409)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new RegisterCommand(dto.FirstName, dto.LastName, dto.Email, dto.Password, ClientIp), ct);

        return Created(string.Empty, result);
    }

    /// <summary>Refresh an access token using a valid refresh token.</summary>
    [HttpPost("refresh-token")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), 200)]
    [ProducesResponseType(401)]
    public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(
            new RefreshTokenCommand(dto.RefreshToken, ClientIp), ct);

        return Ok(result);
    }

    /// <summary>Revoke a refresh token (logout).</summary>
    [HttpPost("revoke-token")]
    [Authorize]
    [ProducesResponseType(200)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> RevokeToken([FromBody] RevokeTokenRequestDto dto, CancellationToken ct)
    {
        var revoked = await _mediator.Send(
            new RevokeTokenCommand(dto.RefreshToken, ClientIp), ct);

        return revoked ? Ok(new { message = "Token revoked." }) : BadRequest(new { error = "Token not found." });
    }
}
