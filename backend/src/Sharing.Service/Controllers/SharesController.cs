using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Sharing.Service.Dtos;
using Sharing.Service.Services;
using Shared.Security;

namespace Sharing.Service.Controllers;

[ApiController]
public class SharesController : ControllerBase
{
    private readonly IShareLinkService _shareLinkService;

    public SharesController(IShareLinkService shareLinkService)
    {
        _shareLinkService = shareLinkService;
    }

    [Authorize]
    [HttpPost("api/trips/{tripId:guid}/shares")]
    public async Task<ActionResult<ShareLinkDto>> Create(Guid tripId, CreateShareLinkRequest request)
    {
        var bearerToken = Request.Headers.Authorization.ToString()["Bearer ".Length..];
        var link = await _shareLinkService.CreateAsync(tripId, User.GetUserId(), bearerToken, request);
        return Ok(link);
    }

    [Authorize]
    [HttpGet("api/trips/{tripId:guid}/shares")]
    public async Task<ActionResult<List<ShareLinkDto>>> GetForTrip(Guid tripId)
    {
        var links = await _shareLinkService.GetForTripAsync(tripId);
        return Ok(links);
    }

    [Authorize]
    [HttpDelete("api/trips/{tripId:guid}/shares/{token}")]
    public async Task<IActionResult> Revoke(Guid tripId, string token)
    {
        await _shareLinkService.RevokeAsync(token);
        return NoContent();
    }

    /// <summary>
    /// Best-effort cascade cleanup, called by TripPlanning.Service when a trip is deleted.
    /// </summary>
    [HttpDelete("api/trips/{tripId:guid}/shares")]
    public async Task<IActionResult> DeleteAllForTrip(Guid tripId)
    {
        await _shareLinkService.DeleteAllForTripAsync(tripId);
        return NoContent();
    }

    /// <summary>
    /// Anonymous: anyone holding the link can check whether it's still valid.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("api/shares/{token}")]
    public async Task<ActionResult<ShareValidationResponse>> Validate(string token)
    {
        var result = await _shareLinkService.ValidateAsync(token);
        return Ok(result);
    }
}
