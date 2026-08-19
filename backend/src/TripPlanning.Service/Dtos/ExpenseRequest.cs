using System.ComponentModel.DataAnnotations;
using TripPlanning.Service.Models;

namespace TripPlanning.Service.Dtos;

public class ExpenseRequest
{
    [Required(ErrorMessage = "Naziv je obavezan."), StringLength(200, MinimumLength = 1, ErrorMessage = "Naziv mora imati do 200 karaktera.")]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Kategorija je obavezna.")]
    public ExpenseCategory Category { get; set; } = ExpenseCategory.Other;

    [Range(0, double.MaxValue, ErrorMessage = "Iznos ne može biti negativan.")]
    public decimal Amount { get; set; }

    [Required(ErrorMessage = "Datum je obavezan.")]
    public DateOnly Date { get; set; }

    [StringLength(2000, ErrorMessage = "Opis može imati do 2000 karaktera.")]
    public string Description { get; set; } = string.Empty;
}
