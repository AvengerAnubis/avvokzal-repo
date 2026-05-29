using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Models;
using AvtovokzalMobileApp.Services;

namespace AvtovokzalMobileApp.ViewModels;

public partial class MainViewModel : BaseViewModel
{
    private readonly IRouteService _routeService;
    private readonly IAuthService _authService;
    private readonly IApiHealthService _healthService;

    [ObservableProperty]
    private string _searchOrigin = string.Empty;

    [ObservableProperty]
    private string _searchDestination = string.Empty;

    [ObservableProperty]
    private List<RouteModel> _routes = new();

    [ObservableProperty]
    private DateTime _selectedDate = DateTime.Today;

    [ObservableProperty]
    private bool _isAuthenticated;

    [ObservableProperty]
    private string? _userGreeting;

    public MainViewModel(IRouteService routeService, IAuthService authService, IApiHealthService healthService)
    {
        _routeService = routeService;
        _authService = authService;
        _healthService = healthService;
        Title = "АВ-Вокзал";

        IsServerOnline = _healthService.IsServerOnline;
        if (!IsServerOnline)
            ConnectionWarning = "Сервер недоступен. Некоторые функции могут быть ограничены.";

        IsAuthenticated = _authService.IsAuthenticated;
        UpdateUserGreeting();

        _healthService.ConnectivityChanged += OnConnectivityChanged;
        _authService.AuthStateChanged += OnAuthStateChanged;
    }

    private void OnAuthStateChanged()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            IsAuthenticated = _authService.IsAuthenticated;
            UpdateUserGreeting();
        });
    }

    private void UpdateUserGreeting()
    {
        UserGreeting = _authService.CurrentUser != null
            ? $"Здравствуйте, {_authService.CurrentUser.FirstName}"
            : "Здравствуйте!";
    }

    private void OnConnectivityChanged()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            IsServerOnline = _healthService.IsServerOnline;
            ConnectionWarning = IsServerOnline ? null : "Сервер недоступен. Некоторые функции могут быть ограничены.";
        });
    }

    [RelayCommand]
    private async Task LoadRoutesAsync()
    {
        if (!IsServerOnline)
        {
            ConnectionWarning = "Сервер недоступен. Невозможно загрузить маршруты.";
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var routes = await _routeService.GetRoutesAsync();
            Routes = routes.Where(r => r.IsActive).ToList();
            if (Routes.Count == 0)
                ErrorMessage = "Нет доступных маршрутов";
        }
        catch
        {
            ErrorMessage = "Не удалось загрузить маршруты";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task SearchRoutesAsync()
    {
        if (!IsServerOnline)
        {
            ConnectionWarning = "Сервер недоступен. Невозможно выполнить поиск.";
            return;
        }

        if (string.IsNullOrWhiteSpace(SearchOrigin) || string.IsNullOrWhiteSpace(SearchDestination))
        {
            await LoadRoutesAsync();
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var routes = await _routeService.SearchRoutesAsync(SearchOrigin.Trim(), SearchDestination.Trim());
            Routes = routes.Where(r => r.IsActive).ToList();
        }
        catch
        {
            ErrorMessage = "Ошибка поиска";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task SelectRouteAsync(RouteModel? route)
    {
        if (route == null) return;
        if (!IsServerOnline)
        {
            ConnectionWarning = "Сервер недоступен. Бронирование временно недоступно.";
            return;
        }
        await Shell.Current.GoToAsync($"booking?routeId={route.Id}");
    }

    [RelayCommand]
    private async Task GoToLoginAsync()
    {
        await Shell.Current.GoToAsync("login");
    }

    [RelayCommand]
    private async Task GoToProfileAsync()
    {
        if (!_authService.IsAuthenticated)
        {
            await Shell.Current.GoToAsync("login");
            return;
        }
        await Shell.Current.GoToAsync("//profile");
    }
}