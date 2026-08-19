using System.Security.Claims;
using TripPlanning.Service.Dtos;

namespace TripPlanning.Service.Services;

public interface IActivityService
{
    Task<List<ActivityDto>> GetActivitiesAsync(Guid tripId, ClaimsPrincipal user, string? shareToken);
    Task<ActivityDto> GetActivityByIdAsync(Guid tripId, Guid activityId, ClaimsPrincipal user, string? shareToken);
    Task<ActivityDto> CreateActivityAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, ActivityRequest request);
    Task<ActivityDto> UpdateActivityAsync(Guid tripId, Guid activityId, ClaimsPrincipal user, string? shareToken, ActivityRequest request);
    Task DeleteActivityAsync(Guid tripId, Guid activityId, ClaimsPrincipal user, string? shareToken);
}
