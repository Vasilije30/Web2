using Identity.Service.Dtos;

namespace Identity.Service.Services;

public interface IAdminUserService
{
    Task<List<UserDto>> GetAllUsersAsync();
    Task<UserDto> UpdateRoleAsync(Guid userId, Guid requestingAdminId, UpdateUserRoleRequest request);
    Task DeleteUserAsync(Guid userId, Guid requestingAdminId);
}
