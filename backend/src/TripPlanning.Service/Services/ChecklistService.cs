using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Shared.Exceptions;
using TripPlanning.Service.Data;
using TripPlanning.Service.Dtos;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Services;

public class ChecklistService : IChecklistService
{
    private readonly TripPlanningDbContext _dbContext;
    private readonly ITripAccessGuard _accessGuard;

    public ChecklistService(TripPlanningDbContext dbContext, ITripAccessGuard accessGuard)
    {
        _dbContext = dbContext;
        _accessGuard = accessGuard;
    }

    public async Task<List<ChecklistItemDto>> GetItemsAsync(Guid tripId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: false);

        var items = await _dbContext.ChecklistItems
            .Where(c => c.TripId == tripId)
            .ToListAsync();

        return items.Select(c => c.ToDto()).ToList();
    }

    public async Task<ChecklistItemDto> CreateItemAsync(Guid tripId, ClaimsPrincipal user, string? shareToken, ChecklistItemRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);

        var item = new ChecklistItem
        {
            Id = Guid.NewGuid(),
            TripId = tripId,
            Text = request.Text,
        };
        request.ApplyTo(item);

        _dbContext.ChecklistItems.Add(item);
        await _dbContext.SaveChangesAsync();

        return item.ToDto();
    }

    public async Task<ChecklistItemDto> UpdateItemAsync(Guid tripId, Guid itemId, ClaimsPrincipal user, string? shareToken, ChecklistItemRequest request)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var item = await GetItemInTripAsync(tripId, itemId);

        request.ApplyTo(item);
        await _dbContext.SaveChangesAsync();

        return item.ToDto();
    }

    public async Task DeleteItemAsync(Guid tripId, Guid itemId, ClaimsPrincipal user, string? shareToken)
    {
        await _accessGuard.GetAccessibleTripAsync(tripId, user, shareToken, requireEdit: true);
        var item = await GetItemInTripAsync(tripId, itemId);

        _dbContext.ChecklistItems.Remove(item);
        await _dbContext.SaveChangesAsync();
    }

    private async Task<ChecklistItem> GetItemInTripAsync(Guid tripId, Guid itemId)
    {
        return await _dbContext.ChecklistItems.FirstOrDefaultAsync(c => c.Id == itemId && c.TripId == tripId)
            ?? throw new NotFoundException($"Stavka checkliste '{itemId}' nije pronađena za plan '{tripId}'.");
    }
}
