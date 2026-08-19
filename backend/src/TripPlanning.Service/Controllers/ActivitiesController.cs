using Microsoft.AspNetCore.Mvc;
using Shared.Security;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/activities")]
public class ActivitiesController : ControllerBase
{
    private readonly IActivityService _activityService;

    public ActivitiesController(IActivityService activityService)
    {
        _activityService = activityService;
    }

    private string? ShareToken => Request.Headers[ShareTokenHeader.Name].FirstOrDefault();

    [HttpGet]
    public async Task<ActionResult<List<ActivityDto>>> GetAll(Guid tripId)
    {
        var activities = await _activityService.GetActivitiesAsync(tripId, User, ShareToken);
        return Ok(activities);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ActivityDto>> GetById(Guid tripId, Guid id)
    {
        var activity = await _activityService.GetActivityByIdAsync(tripId, id, User, ShareToken);
        return Ok(activity);
    }

    [HttpPost]
    public async Task<ActionResult<ActivityDto>> Create(Guid tripId, ActivityRequest request)
    {
        var activity = await _activityService.CreateActivityAsync(tripId, User, ShareToken, request);
        return CreatedAtAction(nameof(GetById), new { tripId, id = activity.Id }, activity);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ActivityDto>> Update(Guid tripId, Guid id, ActivityRequest request)
    {
        var activity = await _activityService.UpdateActivityAsync(tripId, id, User, ShareToken, request);
        return Ok(activity);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id)
    {
        await _activityService.DeleteActivityAsync(tripId, id, User, ShareToken);
        return NoContent();
    }
}
