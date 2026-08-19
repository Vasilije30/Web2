using Microsoft.AspNetCore.Mvc;
using Shared.Security;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Services;

namespace TripPlanning.Service.Controllers;

[ApiController]
[Route("api/trips/{tripId:guid}/checklist-items")]
public class ChecklistItemsController : ControllerBase
{
    private readonly IChecklistService _checklistService;

    public ChecklistItemsController(IChecklistService checklistService)
    {
        _checklistService = checklistService;
    }

    private string? ShareToken => Request.Headers[ShareTokenHeader.Name].FirstOrDefault();

    [HttpGet]
    public async Task<ActionResult<List<ChecklistItemDto>>> GetAll(Guid tripId)
    {
        var items = await _checklistService.GetItemsAsync(tripId, User, ShareToken);
        return Ok(items);
    }

    [HttpPost]
    public async Task<ActionResult<ChecklistItemDto>> Create(Guid tripId, ChecklistItemRequest request)
    {
        var item = await _checklistService.CreateItemAsync(tripId, User, ShareToken, request);
        return CreatedAtAction(nameof(GetAll), new { tripId }, item);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ChecklistItemDto>> Update(Guid tripId, Guid id, ChecklistItemRequest request)
    {
        var item = await _checklistService.UpdateItemAsync(tripId, id, User, ShareToken, request);
        return Ok(item);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid tripId, Guid id)
    {
        await _checklistService.DeleteItemAsync(tripId, id, User, ShareToken);
        return NoContent();
    }
}
