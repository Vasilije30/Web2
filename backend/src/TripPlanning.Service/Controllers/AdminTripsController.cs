using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/trips")]
public class AdminTripsController : ControllerBase
{
    private readonly ITripService _tripService;

    public AdminTripsController(ITripService tripService)
    {
        _tripService = tripService;
    }

    [HttpGet]
    public async Task<ActionResult<List<AdminTripSummaryDto>>> GetAll()
    {
        var trips = await _tripService.GetAllTripsForAdminAsync();
        return Ok(trips);
    }
}
