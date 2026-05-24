namespace AvtovokzalMobileApp.Services;

public interface IApiHealthService
{
    bool IsServerOnline { get; }
    event Action? ConnectivityChanged;
    Task CheckHealthAsync();
}