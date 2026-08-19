namespace TripPlanning.Service.Dtos;

/// <summary>Admin-only overview - includes UserId (the regular TripDto deliberately doesn't).</summary>
public class AdminTripSummaryDto
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public required string Name { get; set; }
    public DateOnly StartDate { get; set; }
    public DateOnly EndDate { get; set; }
    public decimal Budget { get; set; }
    public DateTime CreatedAt { get; set; }
}
