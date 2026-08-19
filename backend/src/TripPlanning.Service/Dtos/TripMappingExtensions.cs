using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public static class TripMappingExtensions
{
    public static TripDto ToDto(this Trip trip) => new()
    {
        Id = trip.Id,
        Name = trip.Name,
        Description = trip.Description,
        StartDate = trip.StartDate,
        EndDate = trip.EndDate,
        Budget = trip.Budget,
        Notes = trip.Notes,
        CreatedAt = trip.CreatedAt,
    };

    public static AdminTripSummaryDto ToAdminSummaryDto(this Trip trip) => new()
    {
        Id = trip.Id,
        UserId = trip.UserId,
        Name = trip.Name,
        StartDate = trip.StartDate,
        EndDate = trip.EndDate,
        Budget = trip.Budget,
        CreatedAt = trip.CreatedAt,
    };

    public static void ApplyTo(this TripRequest request, Trip trip)
    {
        trip.Name = request.Name;
        trip.Description = request.Description;
        trip.StartDate = request.StartDate;
        trip.EndDate = request.EndDate;
        trip.Budget = request.Budget;
        trip.Notes = request.Notes;
    }
}
