using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public static class ActivityMappingExtensions
{
    public static ActivityDto ToDto(this Activity activity) => new()
    {
        Id = activity.Id,
        TripId = activity.TripId,
        DestinationId = activity.DestinationId,
        Name = activity.Name,
        Date = activity.Date,
        Time = activity.Time,
        Location = activity.Location,
        Latitude = activity.Latitude,
        Longitude = activity.Longitude,
        Description = activity.Description,
        EstimatedCost = activity.EstimatedCost,
        Status = activity.Status.ToString(),
    };

    public static void ApplyTo(this ActivityRequest request, Activity activity)
    {
        activity.DestinationId = request.DestinationId;
        activity.Name = request.Name;
        activity.Date = request.Date;
        activity.Time = request.Time;
        activity.Location = request.Location;
        activity.Latitude = request.Latitude;
        activity.Longitude = request.Longitude;
        activity.Description = request.Description;
        activity.EstimatedCost = request.EstimatedCost;
        activity.Status = request.Status;
    }
}
