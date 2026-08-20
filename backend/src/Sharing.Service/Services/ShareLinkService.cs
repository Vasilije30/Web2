using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using Sharing.Service.Clients;
using Sharing.Service.Dtos;
using Sharing.Service.Models;
using Shared.Exceptions;

namespace Sharing.Service.Services;

public class ShareLinkService : IShareLinkService
{
    private const string DictionaryName = "shareLinks";

    private readonly IReliableStateManager _stateManager;
    private readonly ITripPlanningClient _tripPlanningClient;

    public ShareLinkService(IReliableStateManager stateManager, ITripPlanningClient tripPlanningClient)
    {
        _stateManager = stateManager;
        _tripPlanningClient = tripPlanningClient;
    }

    public async Task<ShareLinkDto> CreateAsync(Guid tripId, Guid userId, string bearerToken, CreateShareLinkRequest request)
    {
        var canAccess = await _tripPlanningClient.CanAccessTripAsync(tripId, bearerToken);
        if (!canAccess)
        {
            throw new ForbiddenAccessException("Nemaš pristup ovom planu putovanja.");
        }

        var link = new ShareLink
        {
            Token = Guid.NewGuid().ToString("N"),
            TripId = tripId,
            AccessType = request.AccessType,
            CreatedByUserId = userId,
            CreatedAt = DateTimeOffset.UtcNow,
            ExpiresAt = DateTimeOffset.UtcNow.AddHours(request.ExpiresInHours),
            Revoked = false,
        };

        var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareLink>>(DictionaryName);
        using (var tx = _stateManager.CreateTransaction())
        {
            await dictionary.AddAsync(tx, link.Token, link);
            await tx.CommitAsync();
        }

        return link.ToDto();
    }

    public async Task<List<ShareLinkDto>> GetForTripAsync(Guid tripId)
    {
        var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareLink>>(DictionaryName);
        var result = new List<ShareLinkDto>();

        using var tx = _stateManager.CreateTransaction();
        var enumerable = await dictionary.CreateEnumerableAsync(tx);
        var enumerator = enumerable.GetAsyncEnumerator();
        while (await enumerator.MoveNextAsync(CancellationToken.None))
        {
            if (enumerator.Current.Value.TripId == tripId)
            {
                result.Add(enumerator.Current.Value.ToDto());
            }
        }

        return result;
    }

    public async Task RevokeAsync(string token)
    {
        var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareLink>>(DictionaryName);
        using var tx = _stateManager.CreateTransaction();
        var existing = await dictionary.TryGetValueAsync(tx, token);
        if (!existing.HasValue)
        {
            throw new NotFoundException($"Link za deljenje '{token}' nije pronađen.");
        }

        var updated = existing.Value;
        updated.Revoked = true;
        await dictionary.SetAsync(tx, token, updated);
        await tx.CommitAsync();
    }

    public async Task<ShareValidationResponse> ValidateAsync(string token)
    {
        var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareLink>>(DictionaryName);
        using var tx = _stateManager.CreateTransaction();
        var existing = await dictionary.TryGetValueAsync(tx, token);

        if (!existing.HasValue || !existing.Value.IsActive())
        {
            return new ShareValidationResponse { Valid = false };
        }

        return new ShareValidationResponse
        {
            Valid = true,
            TripId = existing.Value.TripId,
            AccessType = existing.Value.AccessType.ToString(),
        };
    }

    public async Task DeleteAllForTripAsync(Guid tripId)
    {
        var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, ShareLink>>(DictionaryName);

        var tokensToRemove = new List<string>();
        using (var readTx = _stateManager.CreateTransaction())
        {
            var enumerable = await dictionary.CreateEnumerableAsync(readTx);
            var enumerator = enumerable.GetAsyncEnumerator();
            while (await enumerator.MoveNextAsync(CancellationToken.None))
            {
                if (enumerator.Current.Value.TripId == tripId)
                {
                    tokensToRemove.Add(enumerator.Current.Key);
                }
            }
        }

        using var tx = _stateManager.CreateTransaction();
        foreach (var token in tokensToRemove)
        {
            await dictionary.TryRemoveAsync(tx, token);
        }
        await tx.CommitAsync();
    }
}
