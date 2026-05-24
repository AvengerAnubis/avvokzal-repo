using AvtovokzalMobileApp.Models;

namespace AvtovokzalMobileApp.Services;

public interface IOfflineStorageService
{
    Task SaveTicketAsync(TicketModel ticket);
    Task<List<TicketModel>> GetCachedTicketsAsync();
    Task ClearCacheAsync();
}