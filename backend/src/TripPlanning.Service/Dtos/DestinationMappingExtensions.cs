using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public static class DestinationMappingExtensions
{
    public static DestinationDto ToDto(this Destination destination) => new()
    {
        Id = destination.Id,
        TripId = destination.TripId,
        Name = destination.Name,
        Location = destination.Location,
        ArrivalDate = destination.ArrivalDate,
        DepartureDate = destination.DepartureDate,
        Description = destination.Description,
    };

    public static void ApplyTo(this DestinationRequest request, Destination destination)
    {
        destination.Name = request.Name;
        destination.Location = request.Location;
        destination.ArrivalDate = request.ArrivalDate;
        destination.DepartureDate = request.DepartureDate;
        destination.Description = request.Description;
    }
}
