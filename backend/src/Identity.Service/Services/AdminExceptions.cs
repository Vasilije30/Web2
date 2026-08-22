namespace Identity.Service.Services;

public class UserNotFoundException : Exception
{
    public UserNotFoundException(Guid userId) : base($"Korisnik '{userId}' nije pronađen.")
    {
    }
}

public class CannotModifySelfException : Exception
{
    public CannotModifySelfException(string message) : base(message)
    {
    }
}
