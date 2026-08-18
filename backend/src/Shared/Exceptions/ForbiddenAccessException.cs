namespace Shared.Exceptions;

public class ForbiddenAccessException : Exception
{
    public ForbiddenAccessException(string message = "Nemaš pristup ovom resursu.") : base(message)
    {
    }
}
