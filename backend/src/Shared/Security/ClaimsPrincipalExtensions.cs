using System.Security.Claims;

namespace Shared.Security;

public static class ClaimsPrincipalExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? throw new InvalidOperationException("Token does not contain a user id claim.");
        return Guid.Parse(value);
    }

    public static bool IsAdmin(this ClaimsPrincipal principal) =>
        principal.IsInRole("Admin");
}
