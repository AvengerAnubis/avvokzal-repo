using System.Text.Json;
using System.Text.Json.Serialization;
using AvtovokzalMobileApp.Models;

namespace AvtovokzalMobileApp.Services;

public class OfflineStorageService : IOfflineStorageService
{
    private static readonly string CacheFile = Path.Combine(FileSystem.AppDataDirectory, "tickets_cache.json");
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        PropertyNameCaseInsensitive = true,
        DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull
    };
    private const int MaxTickets = 10;

    public async Task SaveTicketAsync(TicketModel ticket)
    {
        try
        {
            var tickets = await GetCachedTicketsAsync();

            var existing = tickets.FindIndex(t => t.Id == ticket.Id);
            if (existing >= 0)
                tickets.RemoveAt(existing);

            tickets.Insert(0, ticket);

            if (tickets.Count > MaxTickets)
                tickets = tickets.Take(MaxTickets).ToList();

            var json = JsonSerializer.Serialize(tickets, JsonOptions);
            await File.WriteAllTextAsync(CacheFile, json);
        }
        catch
        {
        }
    }

    public async Task<List<TicketModel>> GetCachedTicketsAsync()
    {
        try
        {
            if (!File.Exists(CacheFile))
                return new List<TicketModel>();

            var json = await File.ReadAllTextAsync(CacheFile);
            return JsonSerializer.Deserialize<List<TicketModel>>(json, JsonOptions) ?? new List<TicketModel>();
        }
        catch
        {
            return new List<TicketModel>();
        }
    }

    public async Task ClearCacheAsync()
    {
        try
        {
            if (File.Exists(CacheFile))
                File.Delete(CacheFile);
        }
        catch
        {
        }
        await Task.CompletedTask;
    }
}