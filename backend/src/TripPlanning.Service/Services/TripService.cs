using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using TripPlanning.Service.Clients;
using TripPlanning.Service.Data;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

public class TripService : ITripService
{
    private readonly TripPlanningDbContext _dbContext;
    private readonly ITripAccessGuard _accessGuard;
    private readonly ISharingServiceClient _sharingServiceClient;

    public TripService(TripPlanningDbContext dbContext, ITripAccessGuard accessGuard, ISharingServiceClient sharingServiceClient)
    {
        _dbContext = dbContext;
        _accessGuard = accessGuard;
        _sharingServiceClient = sharingServiceClient;
    }

    public async Task<List<TripDto>> GetTripsForUserAsync(Guid userId)
    {
        var trips = await _dbContext.Trips
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return trips.Select(t => t.ToDto()).ToList();
    }

    public async Task<List<AdminTripSummaryDto>> GetAllTripsForAdminAsync()
    {
        var trips = await _dbContext.Trips
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        return trips.Select(t => t.ToAdminSummaryDto()).ToList();
    }

    public async Task<TripDto> GetTripByIdAsync(Guid tripId, ClaimsPrincipal user, string? shareToken)
    {
        var trip = await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);
        return trip.ToDto();
    }

    public async Task<TripDto> CreateTripAsync(Guid userId, TripRequest request)
    {
        var trip = new Trip
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = request.Name,
        };
        request.ApplyTo(trip);

        _dbContext.Trips.Add(trip);
        await _dbContext.SaveChangesAsync();

        return trip.ToDto();
    }

    public async Task<TripDto> UpdateTripAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, TripRequest request)
    {
        var trip = await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        request.ApplyTo(trip);
        await _dbContext.SaveChangesAsync();
        return trip.ToDto();
    }

    public async Task DeleteTripAsync(Guid tripId, ClaimsPrincipal user)
    {
        // No share token accepted here on purpose - see ITripService.DeleteTripAsync.
        var trip = await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken: null, requireEdit: true);
        _dbContext.Trips.Remove(trip);
        await _dbContext.SaveChangesAsync();

        // Best-effort: the trip is already gone from our own database at this point regardless
        // of whether Sharing.Service is reachable. See ISharingServiceClient for the tradeoff.
        await _sharingServiceClient.DeleteSharesForTripAsync(tripId);
    }
}
