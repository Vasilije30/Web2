namespace TripPlanning.Service.Models;

public class Trip
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Name { get; set; }
    public string Description { get; set; } = string.Empty;
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal Budget { get; set; }
    public string Notes { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public List<Destination> Destinations { get; set; } = [];
    public List<Activity> Activities { get; set; } = [];
    public List<ChecklistItem> ChecklistItems { get; set; } = [];
    public List<Expense> Expenses { get; set; } = [];
}
