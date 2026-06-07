using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Models;
using AvtovokzalMobileApp.Services;
using System.Collections.ObjectModel;

namespace AvtovokzalMobileApp.ViewModels;

[QueryProperty(nameof(RouteId), "routeId")]
public partial class BookingViewModel : BaseViewModel
{
    private readonly IRouteService _routeService;
    private readonly IBookingService _bookingService;
    private readonly IAuthService _authService;

    public BookingViewModel(IRouteService routeService, IBookingService bookingService, IAuthService authService)
    {
        _routeService = routeService;
        _bookingService = bookingService;
        _authService = authService;
        Title = "Бронирование";
    }

    [ObservableProperty]
    private string _routeId = string.Empty;

    [ObservableProperty]
    private RouteModel? _selectedRoute;

    [ObservableProperty]
    private TripModel? _selectedTrip;

    [ObservableProperty]
    private List<TripModel> _trips = new();

    [ObservableProperty]
    private int _seatCount = 1;

    [ObservableProperty]
    private string _passengerName = string.Empty;

    [ObservableProperty]
    private string _passengerPhone = string.Empty;

    [ObservableProperty]
    private string _passengerEmail = string.Empty;

    [ObservableProperty]
    private decimal _totalPrice;

    [ObservableProperty]
    private int _availableSeats;

    [ObservableProperty]
    private bool _isBookingComplete;

    [ObservableProperty]
    private BookingModel? _createdBooking;

    [ObservableProperty]
    private int _currentStep;

    [ObservableProperty]
    private ObservableCollection<SeatItemModel> _seatItems = new();

    [ObservableProperty]
    private string _stepHeader = "Выберите рейс";

    [ObservableProperty]
    private string _selectedSeatsSummary = string.Empty;

    partial void OnRouteIdChanged(string value)
    {
        if (!string.IsNullOrEmpty(value))
            _ = LoadRouteDataAsync();
    }

    partial void OnSeatCountChanged(int value)
    {
        if (SelectedRoute != null)
            TotalPrice = SelectedRoute.Price * value;
        UpdateSelectedSeatsSummary();
    }

    partial void OnSelectedTripChanged(TripModel? value)
    {
        if (value != null)
            _ = LoadSeatsAsync();
    }

    private async Task LoadRouteDataAsync()
    {
        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var route = await _routeService.GetRouteAsync(RouteId);
            if (route != null)
            {
                SelectedRoute = route;
                TotalPrice = route.Price * SeatCount;
                var trips = await _routeService.GetTripsByRouteAsync(RouteId);
                Trips = trips.Where(t => t.Status == "SCHEDULED" || t.Status == "DELAYED").ToList();
            }
        }
        catch
        {
            ErrorMessage = "Не удалось загрузить данные маршрута";
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task LoadSeatsAsync()
    {
        if (SelectedTrip == null) return;
        try
        {
            var seats = await _routeService.GetSeatsAsync(SelectedTrip.Id);
            var seatMap = seats != null ? null : await _routeService.GetSeatMapAsync(SelectedTrip.Id);
            if (seats != null)
                AvailableSeats = seats.AvailableSeats;
            else if (seatMap != null)
                AvailableSeats = seatMap.AvailableSeats;
            else
                AvailableSeats = SelectedTrip.TotalSeats;
        }
        catch
        {
            AvailableSeats = SelectedTrip.TotalSeats;
        }
    }

    private async Task LoadSeatMapAsync()
    {
        if (SelectedTrip == null) return;
        try
        {
            var seatMap = await _routeService.GetSeatMapAsync(SelectedTrip.Id);
            if (seatMap?.SeatMap != null && seatMap.SeatMap.Count > 0)
            {
                SeatItems.Clear();
                foreach (var s in seatMap.SeatMap)
                {
                    SeatItems.Add(new SeatItemModel
                    {
                        Number = s.Number,
                        Status = s.Status,
                        IsSelected = false
                    });
                }
                return;
            }
        }
        catch
        {
        }

        var total = SelectedTrip.TotalSeats;
        if (total > 0)
        {
            SeatItems.Clear();
            for (int i = 1; i <= total; i++)
            {
                SeatItems.Add(new SeatItemModel
                {
                    Number = i,
                    Status = "available",
                    IsSelected = false
                });
            }
        }
    }

    [RelayCommand]
    private void ToggleSeat(SeatItemModel seat)
    {
        if (seat.Status == "booked") return;

        if (seat.IsSelected)
        {
            seat.IsSelected = false;
        }
        else
        {
            var currentSelected = SeatItems.Count(s => s.IsSelected);
            if (currentSelected >= SeatCount)
            {
                ErrorMessage = $"Можно выбрать только {SeatCount} мест";
                return;
            }
            seat.IsSelected = true;
        }

        ErrorMessage = null;
        UpdateSelectedSeatsSummary();
    }

    private void UpdateSelectedSeatsSummary()
    {
        var selected = SeatItems.Where(s => s.IsSelected).Select(s => s.Number).ToList();
        SelectedSeatsSummary = selected.Count > 0
            ? $"Места: {string.Join(", ", selected)}"
            : "Места не выбраны";
    }

    [RelayCommand]
    private async Task GoNextStep()
    {
        if (CurrentStep == 0)
        {
            if (SelectedTrip == null)
            {
                ErrorMessage = "Выберите рейс";
                return;
            }
            CurrentStep = 1;
            StepHeader = "Количество мест";
        }
        else if (CurrentStep == 1)
        {
            if (SeatCount < 1)
            {
                ErrorMessage = "Выберите количество мест";
                return;
            }
            await LoadSeatsAsync();
            if (SeatCount > AvailableSeats)
            {
                ErrorMessage = $"Доступно только {AvailableSeats} мест";
                return;
            }
            await LoadSeatMapAsync();
            CurrentStep = 2;
            StepHeader = "Выберите места";
            ErrorMessage = null;
        }
        else if (CurrentStep == 2)
        {
            var selectedCount = SeatItems.Count(s => s.IsSelected);
            if (selectedCount != SeatCount)
            {
                ErrorMessage = $"Выберите ровно {SeatCount} мест (выбрано {selectedCount})";
                return;
            }
            CurrentStep = 3;
            StepHeader = "Данные пассажира";

            if (_authService.CurrentUser != null)
            {
                if (string.IsNullOrWhiteSpace(PassengerName))
                    PassengerName = $"{_authService.CurrentUser.FirstName} {_authService.CurrentUser.LastName}".Trim();
                if (string.IsNullOrWhiteSpace(PassengerPhone))
                    PassengerPhone = _authService.CurrentUser.Phone ?? "";
                if (string.IsNullOrWhiteSpace(PassengerEmail))
                    PassengerEmail = _authService.CurrentUser.Email ?? "";
            }

            ErrorMessage = null;
        }
        else if (CurrentStep == 3)
        {
            await CreateBookingAsync();
        }
    }

    [RelayCommand]
    private async Task GoPrevStep()
    {
        if (CurrentStep > 0)
        {
            CurrentStep--;
            ErrorMessage = null;
            StepHeader = CurrentStep switch
            {
                0 => "Выберите рейс",
                1 => "Количество мест",
                2 => "Выберите места",
                _ => StepHeader
            };
        }
        else
        {
            await Shell.Current.GoToAsync("..");
        }
    }

    [RelayCommand]
    private async Task CreateBookingAsync()
    {
        if (!_authService.IsAuthenticated)
        {
            await Shell.Current.GoToAsync("login");
            return;
        }

        if (SelectedTrip == null) return;

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var selectedSeats = SeatItems
                .Where(s => s.IsSelected)
                .Select(s => s.Number)
                .ToList();

            var booking = await _bookingService.CreateBookingAsync(new CreateBookingRequest
            {
                UserId = _authService.CurrentUser?.Id ?? "",
                TripId = SelectedTrip.Id,
                SeatNumbers = selectedSeats,
                PassengerName = string.IsNullOrWhiteSpace(PassengerName) ? null : PassengerName.Trim(),
                PassengerPhone = string.IsNullOrWhiteSpace(PassengerPhone) ? null : PassengerPhone.Trim(),
                PassengerEmail = string.IsNullOrWhiteSpace(PassengerEmail) ? null : PassengerEmail.Trim()
            });

            if (booking != null)
            {
                CreatedBooking = booking;
                IsBookingComplete = true;
            }
            else
            {
                ErrorMessage = "Ошибка при бронировании";
            }
        }
        catch
        {
            ErrorMessage = AppStrings.ConnectionError;
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task GoToPaymentAsync()
    {
        if (CreatedBooking == null) return;
        await Shell.Current.GoToAsync($"payment?bookingId={CreatedBooking.Id}");
    }

    [RelayCommand]
    private async Task GoToTicketsAsync()
    {
        await Shell.Current.GoToAsync("//profile");
    }
}
