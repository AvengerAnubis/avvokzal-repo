using AvtovokzalMobileApp.Models;

namespace AvtovokzalMobileApp.Services;

public interface IAuthService
{
    Task InitializeAsync();
    Task<AuthResponse?> LoginAsync(string email, string password);
    Task<AuthResponse?> RegisterAsync(string email, string password, string firstName, string lastName, string? phone);
    Task<UserInfo?> GetProfileAsync();
    Task LogoutAsync();
    bool IsAuthenticated { get; }
    string? Token { get; }
    UserInfo? CurrentUser { get; }
    event Action? AuthStateChanged;
}
