namespace TripPlanning.Service.Models;

public class ChecklistItem
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public required string Text { get; set; }
    public bool IsCompleted { get; set; }

    public Trip? Trip { get; set; }
}
