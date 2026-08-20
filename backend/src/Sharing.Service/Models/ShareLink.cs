namespace Sharing.Service.Models;

public enum ShareAccessType
{
    View,
    Edit,
}

/// <summary>
/// Stored as the value in the "shareLinks" Reliable Dictionary, keyed by opaque token.
/// This record (not a JWT) is the source of truth for share access - other services validate
/// access by calling Sharing.Service rather than decoding anything themselves, so a share can
/// be revoked immediately.
/// </summary>
public class ShareLink
{
    public required string Token { get; set; }
    public Guid TripId { get; set; }
    public ShareAccessType AccessType { get; set; }
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset ExpiresAt { get; set; }
    public bool Revoked { get; set; }

    public bool IsActive() => !Revoked && DateTimeOffset.UtcNow < ExpiresAt;
}
