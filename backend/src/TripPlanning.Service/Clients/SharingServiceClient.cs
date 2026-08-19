using System.Net.Http.Json;

namespace TripPlanning.Service.Clients;

public class SharingServiceClient : ISharingServiceClient
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<SharingServiceClient> _logger;

    public SharingServiceClient(HttpClient httpClient, ILogger<SharingServiceClient> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task DeleteSharesForTripAsync(Guid tripId, CancellationToken cancellationToken = default)
    {
        try
        {
            // No leading slash - see the comment in Sharing.Service's TripPlanningClient for why.
            using var response = await _httpClient.DeleteAsync($"api/trips/{tripId}/shares", cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning(
                    "Sharing.Service returned {StatusCode} while cleaning up shares for trip {TripId}.",
                    response.StatusCode, tripId);
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex,
                "Could not reach Sharing.Service to clean up shares for trip {TripId}. " +
                "The trip was still deleted; any of its share links may remain until they expire.",
                tripId);
        }
    }

    public async Task<ShareTokenValidation> ValidateShareTokenAsync(string token, CancellationToken cancellationToken = default)
    {
        try
        {
            var response = await _httpClient.GetFromJsonAsync<ShareValidationPayload>(
                $"api/shares/{Uri.EscapeDataString(token)}", cancellationToken);

            if (response is null || !response.Valid)
            {
                return new ShareTokenValidation(false, null, null);
            }

            return new ShareTokenValidation(true, response.TripId, response.AccessType);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Could not validate share token against Sharing.Service.");
            return new ShareTokenValidation(false, null, null);
        }
    }

    private class ShareValidationPayload
    {
        public bool Valid { get; set; }
        public Guid? TripId { get; set; }
        public string? AccessType { get; set; }
    }
}
