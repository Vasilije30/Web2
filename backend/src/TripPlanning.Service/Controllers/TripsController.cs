using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Security;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Route("api/trips")]
public class TripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public TripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [Authorize]
    [HttpGet]
    public async Task<ActionResult<List<TripDto>>> GetAll()
    {
        var trips = await _tripService.GetTripsForUserAsync(User.GetUserId());
        return Ok(trips);
    }

    /// <summary>
    /// Accessible either as the owner/admin (JWT) or via a share link
    /// (X-Share-Token header, VIEW or EDIT) - no [Authorize], both paths are checked inside.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TripDto>> GetById(Guid id)
    {
        var shareToken = Request.Headers[ShareTokenHeader.Name].FirstOrDefault();
        var trip = await _tripService.GetTripByIdAsync(id, User, shareToken);
        return Ok(trip);
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<TripDto>> Create(TripRequest request)
    {
        var trip = await _tripService.CreateTripAsync(User.GetUserId(), request);
        return CreatedAtAction(nameof(GetById), new { id = trip.Id }, trip);
    }

    /// <summary>Owner/admin or an EDIT share link.</summary>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TripDto>> Update(Guid id, TripRequest request)
    {
        var shareToken = Request.Headers[ShareTokenHeader.Name].FirstOrDefault();
        var trip = await _tripService.UpdateTripAsync(id, User, shareToken, request);
        return Ok(trip);
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        await _tripService.DeleteTripAsync(id, User);
        return NoContent();
    }
}
