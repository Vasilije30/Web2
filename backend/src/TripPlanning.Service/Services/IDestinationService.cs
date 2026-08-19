using System.Security.Claims;
using TripPlanning.Service.Dtos;

namespace TripPlanning.Service.Services;

public interface IDestinationService
{
    Task<List<DestinationDto>> GetDestinationsAsync(Guid tripId, ClaimsPrincipal user, string? shareToken);
    Task<DestinationDto> GetDestinationByIdAsync(Guid tripId, Guid destinationId, ClaimsPrincipal user, string? shareToken);
    Task<DestinationDto> CreateDestinationAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, DestinationRequest request);
    Task<DestinationDto> UpdateDestinationAsync(Guid tripId, Guid destinationId, ClaimsPrincipal user, string? shareToken, DestinationRequest request);
    Task DeleteDestinationAsync(Guid tripId, Guid destinationId, ClaimsPrincipal user, string? shareToken);
}
