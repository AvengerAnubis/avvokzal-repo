namespace AvtovokzalMobileApp.Services;

public interface IApiService
{
    void SetAuthToken(string? token);
    Task<T?> GetAsync<T>(string endpoint);
    Task<T?> PostAsync<T>(string endpoint, object? data = null);
    Task<T?> PutAsync<T>(string endpoint, object? data = null);
    Task<bool> DeleteAsync(string endpoint);
}