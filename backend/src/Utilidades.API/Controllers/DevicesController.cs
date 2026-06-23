using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Utilidades.Application.Devices.Commands;
using Utilidades.Application.Devices.Queries;
using Utilidades.Application.DTOs.Devices;

namespace Utilidades.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class DevicesController : ControllerBase
{
    private readonly IMediator _mediator;

    public DevicesController(IMediator mediator) => _mediator = mediator;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Get all Apple devices for the authenticated user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<AppleDeviceDto>), 200)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDevicesQuery(CurrentUserId), ct);
        return Ok(result);
    }

    /// <summary>Get device detail with cycle records and statistics.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(AppleDeviceDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDeviceDetailQuery(id, CurrentUserId), ct);
        return Ok(result);
    }

    /// <summary>Get the official Apple device catalog.</summary>
    [HttpGet("catalog")]
    [ProducesResponseType(typeof(IEnumerable<DeviceCatalogDto>), 200)]
    public async Task<IActionResult> GetCatalog(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetDeviceCatalogQuery(), ct);
        return Ok(result);
    }

    /// <summary>Add an entry to the device catalog.</summary>
    [HttpPost("catalog")]
    [ProducesResponseType(typeof(DeviceCatalogDto), 201)]
    public async Task<IActionResult> CreateCatalogDevice([FromBody] CreateCatalogDeviceDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateCatalogDeviceCommand(
            dto.Name, dto.Brand, dto.ReleaseYear, dto.MaxCycles, dto.ImageUrl, dto.SortOrder), ct);
        return Created(string.Empty, result);
    }

    /// <summary>Update a catalog device entry.</summary>
    [HttpPut("catalog/{id:guid}")]
    [ProducesResponseType(typeof(DeviceCatalogDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCatalogDevice(Guid id, [FromBody] UpdateCatalogDeviceDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateCatalogDeviceCommand(
            id, dto.Name, dto.Brand, dto.ReleaseYear, dto.MaxCycles, dto.ImageUrl, dto.SortOrder), ct);
        return Ok(result);
    }

    /// <summary>Delete a catalog device entry.</summary>
    [HttpDelete("catalog/{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCatalogDevice(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCatalogDeviceCommand(id), ct);
        return NoContent();
    }

    /// <summary>Register a new Apple device.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(AppleDeviceDto), 201)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Create([FromBody] CreateAppleDeviceDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateAppleDeviceCommand(
            CurrentUserId, dto.DeviceName, dto.PurchaseDate,
            dto.CatalogDeviceId, dto.IsCustomDevice), ct);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an Apple device.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(AppleDeviceDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateAppleDeviceDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateAppleDeviceCommand(
            id, CurrentUserId, dto.DeviceName, dto.PurchaseDate), ct);

        return Ok(result);
    }

    /// <summary>Soft-delete a device.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteAppleDeviceCommand(id, CurrentUserId), ct);
        return NoContent();
    }

    /// <summary>Add a battery cycle record to a device.</summary>
    [HttpPost("{deviceId:guid}/cycles")]
    [ProducesResponseType(typeof(BatteryCycleRecordDto), 201)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> AddCycleRecord(Guid deviceId, [FromBody] CreateBatteryCycleRecordDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new AddCycleRecordCommand(
            deviceId, CurrentUserId, dto.RecordDate, dto.CurrentCycles, dto.Notes), ct);

        return Created(string.Empty, result);
    }

    /// <summary>Update a battery cycle record.</summary>
    [HttpPut("{deviceId:guid}/cycles/{recordId:guid}")]
    [ProducesResponseType(typeof(BatteryCycleRecordDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateCycleRecord(Guid deviceId, Guid recordId, [FromBody] UpdateBatteryCycleRecordDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateCycleRecordCommand(
            recordId, deviceId, CurrentUserId, dto.RecordDate, dto.CurrentCycles, dto.Notes), ct);

        return Ok(result);
    }

    /// <summary>Delete a battery cycle record.</summary>
    [HttpDelete("{deviceId:guid}/cycles/{recordId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteCycleRecord(Guid deviceId, Guid recordId, CancellationToken ct)
    {
        await _mediator.Send(new DeleteCycleRecordCommand(recordId, deviceId, CurrentUserId), ct);
        return NoContent();
    }
}
