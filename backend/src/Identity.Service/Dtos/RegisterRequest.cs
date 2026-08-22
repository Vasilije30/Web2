using System.ComponentModel.DataAnnotations;

namespace Identity.Service.Dtos;

public class RegisterRequest
{
    [Required(ErrorMessage = "Ime je obavezno."), StringLength(200, MinimumLength = 2, ErrorMessage = "Ime mora imati između 2 i 200 karaktera.")]
    public required string Name { get; set; }

    [Required(ErrorMessage = "Email je obavezan."), EmailAddress(ErrorMessage = "Email nije validan."), StringLength(320, ErrorMessage = "Email je predugačak.")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Lozinka je obavezna."), StringLength(100, MinimumLength = 8, ErrorMessage = "Lozinka mora imati bar 8 karaktera.")]
    public required string Password { get; set; }
}
