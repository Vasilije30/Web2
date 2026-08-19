namespace TripPlanning.Service.Models;

public enum ActivityStatus
{
    Planned,
    Reserved,
    Completed,
    Cancelled,
}

public class Activity
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public Guid? DestinationId { get; set; }
    public required string Name { get; set; }
    public DateOnly Date { get; set; }
    public TimeOnly Time { get; set; }
    public string Location { get; set; } = string.Empty;
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public string Description { get; set; } = string.Empty;
    public decimal EstimatedCost { get; set; }
    public ActivityStatus Status { get; set; } = ActivityStatus.Planned;

    public Trip? Trip { get; set; }
}
