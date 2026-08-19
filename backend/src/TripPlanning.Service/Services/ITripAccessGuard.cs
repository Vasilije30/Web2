using System.Security.Claims;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

/// <summary>
/// Loads a Trip and verifies the caller may access it - either as owner/admin via JWT, or via a
/// share token validated against Sharing.Service. Shared by every sub-resource service
/// (Destinations, Activities, Checklist, Expenses) so the rule is defined once.
/// </summary>
public interface ITripAccessGuard
{
    /// <param name="requireEdit">
    /// True for operations that mutate data. A VIEW share token satisfies this only when false;
    /// an EDIT share token satisfies it either way. JWT owner/admin access always satisfies it.
    /// </param>
    Task<Trip> GetAccessibleTripAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, bool requireEdit);
}
