using AvtovokzalMobileApp.Models;

namespace AvtovokzalMobileApp.Services;

public class AuthService : IAuthService
{
    private readonly IApiService _apiService;

    public AuthService(IApiService apiService)
    {
        _apiService = apiService;
    }

    public async Task InitializeAsync()
    {
        try
        {
            var saved = await SecureStorage.Default.GetAsync("auth_token");
            if (!string.IsNullOrEmpty(saved))
            {
                Token = saved;
                _apiService.SetAuthToken(Token);
                var user = await _apiService.GetAsync<UserInfo>("/api/auth/profile");
                if (user != null)
                    CurrentUser = user;
                AuthStateChanged?.Invoke();
            }
        }
        catch
        {
        }
    }

    public bool IsAuthenticated => !string.IsNullOrEmpty(Token);
    public string? Token { get; private set; }
    public UserInfo? CurrentUser { get; private set; }
    public event Action? AuthStateChanged;

    public async Task<AuthResponse?> LoginAsync(string email, string password)
    {
        var result = await _apiService.PostAsync<AuthResponse>("/api/auth/login", new LoginRequest
        {
            Email = email,
            Password = password
        });

        if (result != null)
        {
            Token = result.AccessToken;
            CurrentUser = result.User;
            _apiService.SetAuthToken(Token);
            await SaveTokenAsync(Token);
            AuthStateChanged?.Invoke();
        }

        return result;
    }

    public async Task<AuthResponse?> RegisterAsync(string email, string password, string firstName, string lastName, string? phone)
    {
        var result = await _apiService.PostAsync<AuthResponse>("/api/auth/register", new RegisterRequest
        {
            Email = email,
            Password = password,
            FirstName = firstName,
            LastName = lastName,
            Phone = phone
        });

        if (result != null)
        {
            Token = result.AccessToken;
            CurrentUser = result.User;
            _apiService.SetAuthToken(Token);
            await SaveTokenAsync(Token);
            AuthStateChanged?.Invoke();
        }

        return result;
    }

    public async Task<UserInfo?> GetProfileAsync()
    {
        var user = await _apiService.GetAsync<UserInfo>("/api/auth/profile");
        if (user != null)
        {
            CurrentUser = user;
        }
        return user;
    }

    public async Task LogoutAsync()
    {
        Token = null;
        CurrentUser = null;
        _apiService.SetAuthToken(null);
        SecureStorage.Default.Remove("auth_token");
        AuthStateChanged?.Invoke();
    }

    private async Task SaveTokenAsync(string token)
    {
        try
        {
            await SecureStorage.Default.SetAsync("auth_token", token);
        }
        catch
        {
        }
    }
}
