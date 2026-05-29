using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Models;
using AvtovokzalMobileApp.Services;
using System.Collections.ObjectModel;

namespace AvtovokzalMobileApp.ViewModels;

public partial class ProfileViewModel : BaseViewModel
{
    private readonly IAuthService _authService;
    private readonly IBookingService _bookingService;
    private readonly ITicketService _ticketService;
    private readonly IFavoriteService _favoriteService;
    private readonly IUserService _userService;
    private readonly IOfflineStorageService _offlineStorage;
    private readonly IApiHealthService _healthService;

    [ObservableProperty]
    private UserInfo? _user;

    [ObservableProperty]
    private ObservableCollection<BookingModel> _bookings = new();

    [ObservableProperty]
    private ObservableCollection<FavoriteModel> _favorites = new();

    [ObservableProperty]
    private ObservableCollection<TicketModel> _cachedTickets = new();

    [ObservableProperty]
    private string _firstName = string.Empty;

    [ObservableProperty]
    private string _lastName = string.Empty;

    [ObservableProperty]
    private string _phone = string.Empty;

    [ObservableProperty]
    private bool _isEditingProfile;

    [ObservableProperty]
    private bool _isAuthenticated;

    private bool _isLoadingProfile;

    public ProfileViewModel(IAuthService authService, IBookingService bookingService,
        ITicketService ticketService, IFavoriteService favoriteService, IUserService userService,
        IOfflineStorageService offlineStorage, IApiHealthService healthService)
    {
        _authService = authService;
        _bookingService = bookingService;
        _ticketService = ticketService;
        _favoriteService = favoriteService;
        _userService = userService;
        _offlineStorage = offlineStorage;
        _healthService = healthService;
        Title = "Личный кабинет";

        IsServerOnline = _healthService.IsServerOnline;

        _authService.AuthStateChanged += OnAuthStateChanged;
        _healthService.ConnectivityChanged += OnConnectivityChanged;
    }

    private void OnConnectivityChanged()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            IsServerOnline = _healthService.IsServerOnline;
            ConnectionWarning = IsServerOnline ? null : "Сервер недоступен. Показаны сохранённые данные.";
        });
    }

    private void OnAuthStateChanged()
    {
        MainThread.BeginInvokeOnMainThread(() =>
        {
            IsAuthenticated = _authService.IsAuthenticated;
            if (IsAuthenticated)
                _ = LoadProfileAsync();
            else
                ClearProfile();
        });
    }

    [RelayCommand]
    private async Task LoadProfileAsync()
    {
        if (!_authService.IsAuthenticated || _isLoadingProfile) return;
        _isLoadingProfile = true;

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            if (IsServerOnline)
            {
                var user = await _authService.GetProfileAsync();
                if (user != null)
                {
                    User = user;
                    FirstName = user.FirstName;
                    LastName = user.LastName;
                    Phone = user.Phone ?? "";
                }

                var bookings = await _bookingService.GetUserBookingsAsync(_authService.CurrentUser?.Id ?? "");
                Bookings = new ObservableCollection<BookingModel>(
                    (bookings?.OrderByDescending(b => b.CreatedAt) ?? Enumerable.Empty<BookingModel>()).ToList());

                var favorites = await _favoriteService.GetFavoritesAsync(_authService.CurrentUser?.Id ?? "");
                Favorites = new ObservableCollection<FavoriteModel>(favorites ?? new List<FavoriteModel>());
            }

            var cached = await _offlineStorage.GetCachedTicketsAsync();
            CachedTickets = new ObservableCollection<TicketModel>(cached);

            IsAuthenticated = true;
        }
        catch
        {
            if (IsServerOnline)
                ErrorMessage = "Ошибка загрузки профиля";

            var cached = await _offlineStorage.GetCachedTicketsAsync();
            CachedTickets = new ObservableCollection<TicketModel>(cached);
            ConnectionWarning = "Сервер недоступен. Показаны сохранённые билеты.";
        }
        finally
        {
            IsBusy = false;
            _isLoadingProfile = false;
        }
    }

    [RelayCommand]
    private async Task SaveProfileAsync()
    {
        if (User == null) return;
        if (!IsServerOnline)
        {
            ConnectionWarning = "Сервер недоступен. Изменения не сохранены.";
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var updated = await _userService.UpdateUserAsync(User.Id, FirstName, LastName, Phone);
            if (updated != null)
            {
                User = updated;
                IsEditingProfile = false;
            }
        }
        catch
        {
            ErrorMessage = "Ошибка сохранения";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task LogoutAsync()
    {
        await _authService.LogoutAsync();
        ClearProfile();
        await Shell.Current.GoToAsync("//main");
    }

    private void ClearProfile()
    {
        User = null;
        Bookings.Clear();
        Favorites.Clear();
        CachedTickets.Clear();
        IsAuthenticated = false;
    }

    [RelayCommand]
    private async Task ViewBookingAsync(BookingModel? booking)
    {
        if (booking == null) return;

        if (booking.Status == "CONFIRMED" || booking.Status == "COMPLETED")
        {
            await Shell.Current.GoToAsync($"ticket?bookingId={booking.Id}");
        }
        else if (booking.Status == "PENDING" && IsServerOnline)
        {
            await Shell.Current.GoToAsync($"payment?bookingId={booking.Id}");
        }
    }

    [RelayCommand]
    private async Task ViewCachedTicketAsync(TicketModel? ticket)
    {
        if (ticket == null) return;
        await Shell.Current.GoToAsync($"ticket?bookingId={ticket.BookingId}");
    }

    [RelayCommand]
    private async Task RemoveFavoriteAsync(FavoriteModel? favorite)
    {
        if (favorite == null || User == null) return;

        var removed = await _favoriteService.RemoveFavoriteAsync(User.Id, favorite.RouteId);
        if (removed)
        {
            Favorites.Remove(favorite);
        }
    }

    [RelayCommand]
    private async Task GoToLoginAsync()
    {
        await Shell.Current.GoToAsync("login");
    }

    public void OnAppearing()
    {
        IsServerOnline = _healthService.IsServerOnline;
        ConnectionWarning = IsServerOnline ? null : "Сервер недоступен. Показаны сохранённые данные.";

        IsAuthenticated = _authService.IsAuthenticated;
        if (IsAuthenticated)
            _ = LoadProfileAsync();
        else
            ClearProfile();
    }
}