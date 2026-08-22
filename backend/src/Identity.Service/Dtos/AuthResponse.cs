namespace Identity.Service.Dtos;

public class AuthResponse
{
    public required string Token { get; set; }
    public required UserDto User { get; set; }
}
