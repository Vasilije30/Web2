namespace Sharing.Service.Clients;

public interface ITripPlanningClient
{
    /// <summary>
    /// Verifies the given trip exists and is accessible to the caller identified by
    /// <paramref name="bearerToken"/>, by calling TripPlanning.Service's own
    /// GET /api/trips/{id} with that same token forwarded. True only on a 200 response.
    /// </summary>
    Task<bool> CanAccessTripAsync(Guid tripId, string bearerToken, CancellationToken cancellationToken = default);
}
