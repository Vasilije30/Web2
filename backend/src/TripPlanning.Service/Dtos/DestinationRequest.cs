using System.ComponentModel.DataAnnotations;

namespace TripPlanning.Service.Dtos;

public class DestinationRequest : IValidatableObject
{
    [Required(ErrorMessage = "Naziv je obavezan."), StringLength(200, MinimumLength = 1, ErrorMessage = "Naziv mora imati do 200 karaktera.")]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Lokacija je obavezna."), StringLength(300, MinimumLength = 1, ErrorMessage = "Lokacija mora imati do 300 karaktera.")]
    public required string Location { get; set; }

    [Required(ErrorMessage = "Datum dolaska je obavezan.")]
    public DateOnly ArrivalDate { get; set; }

    [Required(ErrorMessage = "Datum odlaska je obavezan.")]
    public DateOnly DepartureDate { get; set; }

    [StringLength(2000, ErrorMessage = "Opis može imati do 2000 karaktera.")]
    public string Description { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (DepartureDate < ArrivalDate)
        {
            yield return new ValidationResult(
                "Datum odlaska ne može biti pre datuma dolaska.",
                [nameof(DepartureDate)]);
        }
    }
}
