using System.ComponentModel.DataAnnotations;
using Sharing.Service.Models;

namespace Sharing.Service.Dtos;

public class CreateShareLinkRequest
{
    [Required(ErrorMessage = "Tip pristupa je obavezan.")]
    public ShareAccessType AccessType { get; set; }

    /// <summary>How long the link stays valid. Defaults to 72 hours if not provided.</summary>
    [Range(1, 24 * 30, ErrorMessage = "Trajanje linka mora biti između 1 i 720 sati.")]
    public int ExpiresInHours { get; set; } = 72;
}

public class ShareLinkDto
{
    public required string Token { get; set; }
    public Guid TripId { get; set; }
    public required string AccessType { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool Revoked { get; set; }
}

public class ShareValidationResponse
{
    public bool Valid { get; set; }
    public Guid? TripId { get; set; }
    public string? AccessType { get; set; }
}

public static class ShareLinkMappingExtensions
{
    public static ShareLinkDto ToDto(this Models.ShareLink link) => new()
    {
        Token = link.Token,
        TripId = link.TripId,
        AccessType = link.AccessType.ToString(),
        CreatedAt = link.CreatedAt,
        ExpiresAt = link.ExpiresAt,
        Revoked = link.Revoked,
    };
}
