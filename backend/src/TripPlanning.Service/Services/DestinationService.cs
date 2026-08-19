using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Shared.Exceptions;
using TripPlanning.Service.Data;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

public class DestinationService : IDestinationService
{
    private readonly TripPlanningDbContext _dbContext;
    private readonly ITripAccessGuard _accessGuard;

    public DestinationService(TripPlanningDbContext dbContext, ITripAccessGuard accessGuard)
    {
        _dbContext = dbContext;
        _accessGuard = accessGuard;
    }

    public async Task<List<DestinationDto>> GetDestinationsAsync(Guid tripId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);

        var destinations = await _dbContext.Destinations
            .Where(d => d.TripId == tripId)
            .OrderBy(d => d.ArrivalDate)
            .ToListAsync();

        return destinations.Select(d => d.ToDto()).ToList();
    }

    public async Task<DestinationDto> GetDestinationByIdAsync(Guid tripId, Guid destinationId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);
        var destination = await GetDestinationInTripAsync(tripId, destinationId);
        return destination.ToDto();
    }

    public async Task<DestinationDto> CreateDestinationAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, DestinationRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);

        var destination = new Destination
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            Name = request.Name,
            Location = request.Location,
        };
        request.ApplyTo(destination);

        _dbContext.Destinations.Add(destination);
        await _dbContext.SaveChangesAsync();

        return destination.ToDto();
    }

    public async Task<DestinationDto> UpdateDestinationAsync(Guid tripId, Guid destinationId, ClaimsPrincipal user, string? shareToken, DestinationRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var destination = await GetDestinationInTripAsync(tripId, destinationId);

        request.ApplyTo(destination);
        await _dbContext.SaveChangesAsync();

        return destination.ToDto();
    }

    public async Task DeleteDestinationAsync(Guid tripId, Guid destinationId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var destination = await GetDestinationInTripAsync(tripId, destinationId);

        await _dbContext.Activities
            .Where(a => a.DestinationId == destinationId)
            .ExecuteUpdateAsync(setters => setters.SetProperty(a => a.DestinationId, (Guid?)null));

        _dbContext.Destinations.Remove(destination);
        await _dbContext.SaveChangesAsync();
    }

    private async Task<Destination> GetDestinationInTripAsync(Guid tripId, Guid destinationId)
    {
        return await _dbContext.Destinations.FirstOrDefaultAsync(d => d.Id == destinationId && d.TripId == tripId)
            ?? throw new NotFoundException($"Destinacija '{destinationId}' nije pronađena za plan '{tripId}'.");
    }
}
