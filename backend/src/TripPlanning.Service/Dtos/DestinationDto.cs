namespace TripPlanning.Service.Dtos;

public class DestinationDto
{
    public Guid Id { get; set; }
    public Guid TripId { get; set; }
    public required string Name { get; set; }
    public required string Location { get; set; }
    public DateOnly ArrivalDate { get; set; }
    public DateOnly DepartureDate { get; set; }
    public string Description { get; set; } = string.Empty;
}
