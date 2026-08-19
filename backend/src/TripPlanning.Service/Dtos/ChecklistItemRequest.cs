using System.ComponentModel.DataAnnotations;

namespace TripPlanning.Service.Dtos;

public class ChecklistItemRequest
{
    [Required(ErrorMessage = "Tekst je obavezan."), StringLength(300, MinimumLength = 1, ErrorMessage = "Tekst mora imati do 300 karaktera.")]
    public required string Text { get; set; }

    public bool IsCompleted { get; set; }
}
