using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Shared.Exceptions;
using TripPlanning.Service.Data;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

public class ActivityService : IActivityService
{
    private readonly TripPlanningDbContext _dbContext;
    private readonly ITripAccessGuard _accessGuard;

    public ActivityService(TripPlanningDbContext dbContext, ITripAccessGuard accessGuard)
    {
        _dbContext = dbContext;
        _accessGuard = accessGuard;
    }

    public async Task<List<ActivityDto>> GetActivitiesAsync(Guid tripId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);

        var activities = await _dbContext.Activities
            .Where(a => a.TripId == tripId)
            .OrderBy(a => a.Date).ThenBy(a => a.Time)
            .ToListAsync();

        return activities.Select(a => a.ToDto()).ToList();
    }

    public async Task<ActivityDto> GetActivityByIdAsync(Guid tripId, Guid activityId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);
        var activity = await GetActivityInTripAsync(tripId, activityId);
        return activity.ToDto();
    }

    public async Task<ActivityDto> CreateActivityAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, ActivityRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);

        var activity = new Activity
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            Name = request.Name,
        };
        request.ApplyTo(activity);

        _dbContext.Activities.Add(activity);
        await _dbContext.SaveChangesAsync();

        return activity.ToDto();
    }

    public async Task<ActivityDto> UpdateActivityAsync(Guid tripId, Guid activityId, ClaimsPrincipal user, string? shareToken, ActivityRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var activity = await GetActivityInTripAsync(tripId, activityId);

        request.ApplyTo(activity);
        await _dbContext.SaveChangesAsync();

        return activity.ToDto();
    }

    public async Task DeleteActivityAsync(Guid tripId, Guid activityId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var activity = await GetActivityInTripAsync(tripId, activityId);

        _dbContext.Activities.Remove(activity);
        await _dbContext.SaveChangesAsync();
    }

    private async Task<Activity> GetActivityInTripAsync(Guid tripId, Guid activityId)
    {
        return await _dbContext.Activities.FirstOrDefaultAsync(a => a.Id == activityId && a.TripId == tripId)
            ?? throw new NotFoundException($"Aktivnost '{activityId}' nije pronađena za plan '{tripId}'.");
    }
}
