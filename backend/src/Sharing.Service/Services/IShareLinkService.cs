using Sharing.Service.Dtos;

namespace Sharing.Service.Services;

public interface IShareLinkService
{
    Task<ShareLinkDto> CreateAsync(Guid tripId, Guid userId, string bearerToken, CreateShareLinkRequest request);
    Task<List<ShareLinkDto>> GetForTripAsync(Guid tripId);
    Task RevokeAsync(string token);
    Task<ShareValidationResponse> ValidateAsync(string token);
    Task DeleteAllForTripAsync(Guid tripId);
}
