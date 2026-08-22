using Identity.Service.Models;

namespace Identity.Service.Services;

public interface ITokenService
{
    string GenerateToken(User user);
}
