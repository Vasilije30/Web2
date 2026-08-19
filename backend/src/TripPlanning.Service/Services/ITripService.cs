using System.Security.Claims;
using TripPlanning.Service.Dtos;

namespace TripPlanning.Service.Services;

public interface ITripService
{
    Task<List<TripDto>> GetTripsForUserAsync(Guid userId);

    /// <summary>Admin-only overview across all users' trips. Controller enforces the Admin role.</summary>
    Task<List<AdminTripSummaryDto>> GetAllTripsForAdminAsync();
    Task<TripDto> GetTripByIdAsync(Guid tripId, ClaimsPrincipal user, string? shareToken);
    Task<TripDto> CreateTripAsync(Guid userId, TripRequest request);
    Task<TripDto> UpdateTripAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, TripRequest request);

    /// <summary>Owner/admin only - deleting the whole trip is deliberately not shareable via a share token.</summary>
    Task DeleteTripAsync(Guid tripId, ClaimsPrincipal user);
}
