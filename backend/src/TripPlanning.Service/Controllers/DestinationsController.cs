using Microsoft.AspNetCore.Mvc;
using Shared.Security;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

/// <summary>
/// No class-level [Authorize]: every action accepts either an owner/admin JWT or a share token
/// (X-Share-Token header) - see ITripAccessGuard.
/// </summary>
[ApiController]
[Route("api/trips/{tripId:guid}/destinations")]
public class DestinationsController : ControllerBase
{
    private readonly IDestinationService _destinationService;

    public DestinationsController(IDestinationService destinationService)
    {
        _destinationService = destinationService;
    }

    private string? ShareToken => Request.Headers[ShareTokenHeader.Name].FirstOrDefault();

    [HttpGet]
    public async Task<ActionResult<List<DestinationDto>>> GetAll(Guid tripId)
    {
        var destinations = await _destinationService.GetDestinationsAsync(tripId, User, ShareToken);
        return Ok(destinations);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DestinationDto>> GetById(Guid tripId, Guid id)
    {
        var destination = await _destinationService.GetDestinationByIdAsync(tripId, id, User, ShareToken);
        return Ok(destination);
    }

    [HttpPost]
    public async Task<ActionResult<DestinationDto>> Create(Guid tripId, DestinationRequest request)
    {
        var destination = await _destinationService.CreateDestinationAsync(tripId, User, ShareToken, request);
        return CreatedAtAction(nameof(GetById), new { tripId, id = destination.Id }, destination);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<DestinationDto>> Update(Guid tripId, Guid id, DestinationRequest request)
    {
        var destination = await _destinationService.UpdateDestinationAsync(tripId, id, User, ShareToken, request);
        return Ok(destination);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id)
    {
        await _destinationService.DeleteDestinationAsync(tripId, id, User, ShareToken);
        return NoContent();
    }
}
