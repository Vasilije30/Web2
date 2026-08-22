namespace Identity.Service.Services;

public class EmailAlreadyRegisteredException : Exception
{
    public EmailAlreadyRegisteredException(string email) : base($"Email '{email}' je već registrovan.")
    {
    }
}

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException() : base("Pogrešan email ili lozinka.")
    {
    }
}
