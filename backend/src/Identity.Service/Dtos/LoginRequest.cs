using System.ComponentModel.DataAnnotations;

namespace Identity.Service.Dtos;

public class LoginRequest
{
    [Required(ErrorMessage = "Email je obavezan."), EmailAddress(ErrorMessage = "Email nije validan.")]
    public required string Email { get; set; }

    [Required(ErrorMessage = "Lozinka je obavezna.")]
    public required string Password { get; set; }
}
