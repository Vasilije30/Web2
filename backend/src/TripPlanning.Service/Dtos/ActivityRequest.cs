using System.ComponentModel.DataAnnotations;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public class ActivityRequest
{
    public Guid? DestinationId { get; set; }

    [Required(ErrorMessage = "Naziv je obavezan."), StringLength(200, MinimumLength = 1, ErrorMessage = "Naziv mora imati do 200 karaktera.")]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Datum je obavezan.")]
    public DateOnly Date { get; set; }

    [Required(ErrorMessage = "Vreme je obavezno.")]
    public TimeOnly Time { get; set; }

    [StringLength(300, ErrorMessage = "Lokacija može imati do 300 karaktera.")]
    public string Location { get; set; } = string.Empty;

    [Range(-90, 90, ErrorMessage = "Geografska širina nije validna.")]
    public double? Latitude { get; set; }

    [Range(-180, 180, ErrorMessage = "Geografska dužina nije validna.")]
    public double? Longitude { get; set; }

    [StringLength(2000, ErrorMessage = "Opis može imati do 2000 karaktera.")]
    public string Description { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Procenjeni trošak ne može biti negativan.")]
    public decimal EstimatedCost { get; set; }

    [Required(ErrorMessage = "Status je obavezan.")]
    public ActivityStatus Status { get; set; } = ActivityStatus.Planned;
}
