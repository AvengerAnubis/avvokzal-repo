using System.Net.Http.Json;

namespace AvtovokzalMobileApp.Services;

public class ApiHealthService : IApiHealthService
{
    private readonly HttpClient _httpClient;

    public ApiHealthService(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public bool IsServerOnline { get; private set; } = true;
    public event Action? ConnectivityChanged;

    public async Task CheckHealthAsync()
    {
        try
        {
            using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
            var response = await _httpClient.GetAsync("/api/health", cts.Token);
            var wasOnline = IsServerOnline;
            IsServerOnline = response.IsSuccessStatusCode;
            if (wasOnline != IsServerOnline)
                ConnectivityChanged?.Invoke();
        }
        catch
        {
            if (IsServerOnline)
            {
                IsServerOnline = false;
                ConnectivityChanged?.Invoke();
            }
        }
    }
}