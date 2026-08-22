using Identity.Service.Dtos;
using Identity.Service.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.Security;

namespace Identity.Service.Controllers;

[ApiController]
[Authorize(Roles = "Admin")]
[Route("api/admin/users")]
public class AdminUsersController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminUsersController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    public async Task<ActionResult<List<UserDto>>> GetAll()
    {
        var users = await _adminUserService.GetAllUsersAsync();
        return Ok(users);
    }

    [HttpPut("{id:guid}/role")]
    public async Task<ActionResult<UserDto>> UpdateRole(Guid id, UpdateUserRoleRequest request)
    {
        try
        {
            var user = await _adminUserService.UpdateRoleAsync(id, User.GetUserId(), request);
            return Ok(user);
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (CannotModifySelfException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        try
        {
            await _adminUserService.DeleteUserAsync(id, User.GetUserId());
            return NoContent();
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (CannotModifySelfException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
