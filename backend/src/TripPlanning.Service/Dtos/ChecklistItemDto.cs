namespace TripPlanning.Service.Dtos;

public class ChecklistItemDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public required string Text { get; set; }
    public bool IsCompleted { get; set; }
}
