using System.Net;
using System.Text.Json;
using FluentValidation;

namespace Utilidades.API.Middleware;

public class GlobalExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<GlobalExceptionHandlingMiddleware> _logger;

    public GlobalExceptionHandlingMiddleware(RequestDelegate next, ILogger<GlobalExceptionHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        var (statusCode, title, errors) = exception switch
        {
            ValidationException ve => (
                HttpStatusCode.UnprocessableEntity,
                "Validation Failed",
                ve.Errors.Select(e => new { field = e.PropertyName, message = e.ErrorMessage })),

            KeyNotFoundException => (
                HttpStatusCode.NotFound,
                "Resource Not Found",
                Enumerable.Empty<object>()),

            UnauthorizedAccessException => (
                HttpStatusCode.Unauthorized,
                "Unauthorized",
                Enumerable.Empty<object>()),

            InvalidOperationException oe => (
                HttpStatusCode.Conflict,
                oe.Message,
                Enumerable.Empty<object>()),

            _ => (
                HttpStatusCode.InternalServerError,
                "An unexpected error occurred.",
                Enumerable.Empty<object>())
        };

        var level = (int)statusCode >= 500 ? LogLevel.Error : LogLevel.Warning;
        _logger.Log(level, exception,
            "Request {Method} {Path} failed with {StatusCode}: {Message}",
            context.Request.Method, context.Request.Path, (int)statusCode, exception.Message);

        context.Response.StatusCode = (int)statusCode;
        context.Response.ContentType = "application/json";

        var response = new
        {
            status = (int)statusCode,
            title,
            traceId = context.TraceIdentifier,
            errors
        };

        await context.Response.WriteAsync(
            JsonSerializer.Serialize(response, new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase }));
    }
}
