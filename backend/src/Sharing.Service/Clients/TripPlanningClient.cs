using System.Net.Http.Headers;

namespace Sharing.Service.Clients;

public class TripPlanningClient : ITripPlanningClient
{
    private readonly HttpClient _httpClient;

    public TripPlanningClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<bool> CanAccessTripAsync(Guid tripId, string bearerToken, CancellationToken cancellationToken = default)
    {
        // Deliberately no leading slash: HttpClient treats a leading "/" as an absolute path that
        // replaces BaseAddress's path entirely (dropping "/TravelPlannerApp/TripPlanningService"),
        // instead of appending to it.
        using var request = new HttpRequestMessage(HttpMethod.Get, $"api/trips/{tripId}");
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", bearerToken);

        using var response = await _httpClient.SendAsync(request, cancellationToken);
        return response.IsSuccessStatusCode;
    }
}
