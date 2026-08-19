namespace TripPlanning.Service.Clients;

public record ShareTokenValidation(bool Valid, Guid? TripId, string? AccessType);

public interface ISharingServiceClient
{
    /// <summary>Best-effort cascade cleanup: removes any share links for a deleted trip.</summary>
    Task DeleteSharesForTripAsync(Guid tripId, CancellationToken cancellationToken = default);

    /// <summary>Checks a share token with Sharing.Service (the source of truth for share links).</summary>
    Task<ShareTokenValidation> ValidateShareTokenAsync(string token, CancellationToken cancellationToken = default);
}
