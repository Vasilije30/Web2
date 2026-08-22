using Identity.Service.Models;

namespace Identity.Service.Dtos;

public static class UserMappingExtensions
{
    public static UserDto ToDto(this User user) => new()
    {
        Id = user.Id,
        Name = user.Name,
        Email = user.Email,
        Role = user.Role.ToString(),
        CreatedAt = user.CreatedAt,
    };
}
