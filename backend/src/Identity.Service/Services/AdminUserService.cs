using Identity.Service.Data;
using Identity.Service.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Identity.Service.Services;

public class AdminUserService : IAdminUserService
{
    private readonly IdentityDbContext _dbContext;

    public AdminUserService(IdentityDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<List<UserDto>> GetAllUsersAsync()
    {
        var users = await _dbContext.Users.OrderBy(u => u.CreatedAt).ToListAsync();
        return users.Select(u => u.ToDto()).ToList();
    }

    public async Task<UserDto> UpdateRoleAsync(Guid userId, Guid requestingAdminId, UpdateUserRoleRequest request)
    {
        if (userId == requestingAdminId)
        {
            throw new CannotModifySelfException("Ne možeš promeniti sopstvenu ulogu.");
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new UserNotFoundException(userId);

        user.Role = request.Role;
        await _dbContext.SaveChangesAsync();

        return user.ToDto();
    }

    public async Task DeleteUserAsync(Guid userId, Guid requestingAdminId)
    {
        if (userId == requestingAdminId)
        {
            throw new CannotModifySelfException("Ne možeš obrisati sopstveni nalog.");
        }

        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.Id == userId)
            ?? throw new UserNotFoundException(userId);

        _dbContext.Users.Remove(user);
        await _dbContext.SaveChangesAsync();
    }
}
