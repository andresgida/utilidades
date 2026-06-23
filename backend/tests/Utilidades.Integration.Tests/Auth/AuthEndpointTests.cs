using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Utilidades.Application.DTOs.Auth;
using Xunit;

namespace Utilidades.Integration.Tests.Auth;

public class AuthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public AuthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task Register_WithValidData_ShouldReturn201()
    {
        var request = new RegisterRequestDto(
            "Test", "User",
            $"test_{Guid.NewGuid():N}@example.com",
            "Password123!", "Password123!");

        var response = await _client.PostAsJsonAsync("/api/auth/register", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<AuthResponseDto>();
        body!.AccessToken.Should().NotBeNullOrEmpty();
        body.RefreshToken.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Login_WithInvalidCredentials_ShouldReturn401()
    {
        var request = new LoginRequestDto("nobody@example.com", "WrongPassword1!");

        var response = await _client.PostAsJsonAsync("/api/auth/login", request);

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetVehicles_WithoutToken_ShouldReturn401()
    {
        var response = await _client.GetAsync("/api/vehicles");
        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
