using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Utilidades.Application.DTOs.Vehicles;
using Utilidades.Application.Vehicles.Commands;
using Utilidades.Application.Vehicles.Queries;

namespace Utilidades.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[Produces("application/json")]
public class VehiclesController : ControllerBase
{
    private readonly IMediator _mediator;

    public VehiclesController(IMediator mediator) => _mediator = mediator;

    private Guid CurrentUserId =>
        Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    /// <summary>Get all vehicles for the authenticated user.</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<VehicleDto>), 200)]
    public async Task<IActionResult> GetAll(CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVehiclesQuery(CurrentUserId), ct);
        return Ok(result);
    }

    /// <summary>Get vehicle detail with records and statistics.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(VehicleDetailDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await _mediator.Send(new GetVehicleDetailQuery(id, CurrentUserId), ct);
        return Ok(result);
    }

    /// <summary>Create a new vehicle.</summary>
    [HttpPost]
    [ProducesResponseType(typeof(VehicleDto), 201)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Create([FromBody] CreateVehicleDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new CreateVehicleCommand(
            CurrentUserId, dto.Name, dto.Brand, dto.Model,
            dto.Year, dto.LicensePlate, dto.StartCountDate, dto.BaseMileage, dto.ImageUrl), ct);

        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    /// <summary>Update an existing vehicle.</summary>
    [HttpPut("{id:guid}")]
    [ProducesResponseType(typeof(VehicleDto), 200)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateVehicleDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateVehicleCommand(
            id, CurrentUserId, dto.Name, dto.Brand, dto.Model,
            dto.Year, dto.LicensePlate, dto.StartCountDate, dto.BaseMileage, dto.ImageUrl), ct);

        return Ok(result);
    }

    /// <summary>Soft-delete a vehicle.</summary>
    [HttpDelete("{id:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        await _mediator.Send(new DeleteVehicleCommand(id, CurrentUserId), ct);
        return NoContent();
    }

    /// <summary>Add a mileage record to a vehicle.</summary>
    [HttpPost("{vehicleId:guid}/records")]
    [ProducesResponseType(typeof(MileageRecordDto), 201)]
    [ProducesResponseType(404)]
    [ProducesResponseType(422)]
    public async Task<IActionResult> AddRecord(Guid vehicleId, [FromBody] CreateMileageRecordDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new AddMileageRecordCommand(
            vehicleId, CurrentUserId, dto.RecordDate, dto.CurrentMileage, dto.Observations), ct);

        return Created(string.Empty, result);
    }

    /// <summary>Update a mileage record.</summary>
    [HttpPut("{vehicleId:guid}/records/{recordId:guid}")]
    [ProducesResponseType(typeof(MileageRecordDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateRecord(Guid vehicleId, Guid recordId, [FromBody] UpdateMileageRecordDto dto, CancellationToken ct)
    {
        var result = await _mediator.Send(new UpdateMileageRecordCommand(
            recordId, vehicleId, CurrentUserId, dto.RecordDate, dto.CurrentMileage, dto.Observations), ct);

        return Ok(result);
    }

    /// <summary>Delete a mileage record.</summary>
    [HttpDelete("{vehicleId:guid}/records/{recordId:guid}")]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> DeleteRecord(Guid vehicleId, Guid recordId, CancellationToken ct)
    {
        await _mediator.Send(new DeleteMileageRecordCommand(recordId, vehicleId, CurrentUserId), ct);
        return NoContent();
    }
}
