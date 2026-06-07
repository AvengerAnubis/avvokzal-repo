using System.Diagnostics;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace AvtovokzalMobileApp.Services;

public class ApiService : IApiService
{
    private readonly HttpClient _httpClient;
    private readonly JsonSerializerOptions _jsonOptions;

    public ApiService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _jsonOptions = new JsonSerializerOptions
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true,
            DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull,
            NumberHandling = JsonNumberHandling.AllowReadingFromString
        };
    }

    public void SetAuthToken(string? token)
    {
        _httpClient.DefaultRequestHeaders.Authorization =
            string.IsNullOrEmpty(token) ? null : new AuthenticationHeaderValue("Bearer", token);
    }

    public async Task<T?> GetAsync<T>(string endpoint)
    {
        try
        {
            var response = await _httpClient.GetAsync(endpoint);
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[ApiService] GET {endpoint} failed: {ex.Message}");
            return default;
        }
    }

    public async Task<T?> PostAsync<T>(string endpoint, object? data = null)
    {
        try
        {
            HttpResponseMessage response;
            if (data != null)
            {
                response = await _httpClient.PostAsJsonAsync(endpoint, data, _jsonOptions);
            }
            else
            {
                using var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
                response = await _httpClient.PostAsync(endpoint, content);
            }
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[ApiService] POST {endpoint} failed: {ex.Message}");
            return default;
        }
    }

    public async Task<T?> PutAsync<T>(string endpoint, object? data = null)
    {
        try
        {
            HttpResponseMessage response;
            if (data != null)
            {
                response = await _httpClient.PutAsJsonAsync(endpoint, data, _jsonOptions);
            }
            else
            {
                using var content = new StringContent("{}", System.Text.Encoding.UTF8, "application/json");
                response = await _httpClient.PutAsync(endpoint, content);
            }
            response.EnsureSuccessStatusCode();
            return await response.Content.ReadFromJsonAsync<T>(_jsonOptions);
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[ApiService] PUT {endpoint} failed: {ex.Message}");
            return default;
        }
    }

    public async Task<bool> DeleteAsync(string endpoint)
    {
        try
        {
            var response = await _httpClient.DeleteAsync(endpoint);
            return response.IsSuccessStatusCode;
        }
        catch (Exception ex)
        {
            Debug.WriteLine($"[ApiService] DELETE {endpoint} failed: {ex.Message}");
            return false;
        }
    }
}
