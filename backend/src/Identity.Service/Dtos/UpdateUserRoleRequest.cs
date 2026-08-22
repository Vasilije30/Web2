using System.ComponentModel.DataAnnotations;
using Identity.Service.Models;

namespace Identity.Service.Dtos;

public class UpdateUserRoleRequest
{
    [Required(ErrorMessage = "Uloga je obavezna.")]
    public UserRole Role { get; set; }
}
