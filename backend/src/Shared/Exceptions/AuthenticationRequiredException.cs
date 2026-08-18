namespace Shared.Exceptions;

/// <summary>
/// Thrown when a request has neither a valid JWT nor a valid share token - i.e. there was no
/// credential at all to evaluate, as opposed to ForbiddenAccessException where a credential was
/// present but didn't grant enough access.
/// </summary>
public class AuthenticationRequiredException : Exception
{
    public AuthenticationRequiredException(string message = "Potrebna je prijava.") : base(message)
    {
    }
}
