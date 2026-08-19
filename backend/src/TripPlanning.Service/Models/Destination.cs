namespace TripPlanning.Service.Models;

public class Destination
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public required string Name { get; set; }
    public required string Location { get; set; }
    public DateOnly ArrivalDate { get; set; }
    public DateOnly DepartureDate { get; set; }
    public string Description { get; set; } = string.Empty;

    public Trip? Trip { get; set; }
}
