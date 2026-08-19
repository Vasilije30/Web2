using System.ComponentModel.DataAnnotations;

namespace TripPlanning.Service.Dtos;

public class TripRequest : IValidatableObject
{
    [Required(ErrorMessage = "Naziv je obavezan."), StringLength(200, MinimumLength = 1, ErrorMessage = "Naziv mora imati do 200 karaktera.")]
    public required string Name { get; set; }

    [StringLength(2000, ErrorMessage = "Opis može imati do 2000 karaktera.")]
    public string Description { get; set; } = string.Empty;

    [Required(ErrorMessage = "Početni datum je obavezan.")]
    public DateOnly StartDate { get; set; }

    [Required(ErrorMessage = "Krajnji datum je obavezan.")]
    public DateOnly EndDate { get; set; }

    [Range(0, double.MaxValue, ErrorMessage = "Budžet ne može biti negativan.")]
    public decimal Budget { get; set; }

    [StringLength(2000, ErrorMessage = "Napomene mogu imati do 2000 karaktera.")]
    public string Notes { get; set; } = string.Empty;

    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (EndDate < StartDate)
        {
            yield return new ValidationResult(
                "Krajnji datum ne može biti pre početnog datuma.",
                [nameof(EndDate)]);
        }
    }
}
