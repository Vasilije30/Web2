using System.Security.Claims;
using TripPlanning.Service.Dtos;

namespace TripPlanning.Service.Services;

public interface IChecklistService
{
    Task<List<ChecklistItemDto>> GetItemsAsync(Guid tripId, ClaimsPrincipal user, string? shareToken);
    Task<ChecklistItemDto> CreateItemAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, ChecklistItemRequest request);
    Task<ChecklistItemDto> UpdateItemAsync(Guid tripId, Guid itemId, ClaimsPrincipal user, string? shareToken, ChecklistItemRequest request);
    Task DeleteItemAsync(Guid tripId, Guid itemId, ClaimsPrincipal user, string? shareToken);
}
