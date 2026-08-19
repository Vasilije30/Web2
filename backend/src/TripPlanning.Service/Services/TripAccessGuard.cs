using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Shared.Exceptions;
using Shared.Security;
using TripPlanning.Service.Clients;
using TripPlanning.Service.Data;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

public class TripAccessGuard : ITripAccessGuard
{
    private readonly TripPlanningDbContext _dbContext;
    private readonly ISharingServiceClient _sharingServiceClient;

    public TripAccessGuard(TripPlanningDbContext dbContext, ISharingServiceClient sharingServiceClient)
    {
        _dbContext = dbContext;
        _sharingServiceClient = sharingServiceClient;
    }

    public async Task<Trip> GetAccessibleTripAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, bool requireEdit)
    {
        var trip = await _dbContext.Trips.FirstOrDefaultAsync(t => t.Id == tripId)
            ?? throw new NotFoundException($"Plan putovanja '{tripId}' nije pronađen.");

        if (user.Identity?.IsAuthenticated == true && (trip.UserId == user.GetUserId() || user.IsAdmin()))
        {
            return trip;
        }

        if (!string.IsNullOrEmpty(shareToken))
        {
            var validation = await _sharingServiceClient.ValidateShareTokenAsync(shareToken);
            var accessIsSufficient = validation.AccessType == "Edit" || (!requireEdit && validation.AccessType == "View");

            if (validation.Valid && validation.TripId == tripId && accessIsSufficient)
            {
                return trip;
            }
        }

        if (user.Identity?.IsAuthenticated != true && string.IsNullOrEmpty(shareToken))
        {
            throw new AuthenticationRequiredException();
        }

        throw new ForbiddenAccessException("Nemaš pristup ovom planu putovanja.");
    }
}
