using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public static class ChecklistItemMappingExtensions
{
    public static ChecklistItemDto ToDto(this ChecklistItem item) => new()
    {
        Id = item.Id,
        TripId = item.TripId,
        Text = item.Text,
        IsCompleted = item.IsCompleted,
    };

    public static void ApplyTo(this ChecklistItemRequest request, ChecklistItem item)
    {
        item.Text = request.Text;
        item.IsCompleted = request.IsCompleted;
    }
}
