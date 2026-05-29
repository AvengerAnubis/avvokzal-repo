using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Text.Json.Serialization;

namespace AvtovokzalMobileApp.Models;

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
}

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
}

public class AuthResponse
{
    [JsonPropertyName("access_token")]
    public string AccessToken { get; set; } = string.Empty;
    public UserInfo? User { get; set; }
}

public class UserInfo
{
    public string Id { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Phone { get; set; }
    public string Role { get; set; } = "USER";
    public bool IsActive { get; set; } = true;
}

public class RouteModel
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Origin { get; set; } = string.Empty;
    public string Destination { get; set; } = string.Empty;
    public double? Distance { get; set; }
    public int? Duration { get; set; }
    public decimal Price { get; set; }
    public bool IsActive { get; set; } = true;
}

public class TripModel
{
    public string Id { get; set; } = string.Empty;
    public string RouteId { get; set; } = string.Empty;
    public DateTime DepartureTime { get; set; }
    public DateTime ArrivalTime { get; set; }
    public string Status { get; set; } = "SCHEDULED";
    public string? BusNumber { get; set; }
    public string? DriverId { get; set; }
    public string? OperatorId { get; set; }
    public int TotalSeats { get; set; } = 40;
    public RouteModel? Route { get; set; }
}

public class BookingModel
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public int Seats { get; set; }
    public List<int> SeatNumbers { get; set; } = new();
    public decimal TotalPrice { get; set; }
    public string Status { get; set; } = "PENDING";
    public DateTime CreatedAt { get; set; }
    public string? PassengerName { get; set; }
    public string? PassengerPhone { get; set; }
    public string? PassengerEmail { get; set; }
    public TripModel? Trip { get; set; }
    public UserInfo? User { get; set; }
    public PaymentModel? Payment { get; set; }
    public List<TicketModel>? Tickets { get; set; }
}

public class CreateBookingRequest
{
    public string UserId { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public List<int> SeatNumbers { get; set; } = new();
    public string? PassengerName { get; set; }
    public string? PassengerPhone { get; set; }
    public string? PassengerEmail { get; set; }
}

public class SeatStatus
{
    public int Number { get; set; }
    public string Status { get; set; } = "available";
}

public class SeatMapResponse
{
    public int TotalSeats { get; set; }
    public int BookedSeats { get; set; }
    public int AvailableSeats { get; set; }
    public List<SeatStatus> SeatMap { get; set; } = new();
}

public class SeatItemModel : INotifyPropertyChanged
{
    private int _number;
    private string _status = "available";
    private bool _isSelected;

    public int Number
    {
        get => _number;
        set { _number = value; OnPropertyChanged(); }
    }

    public string Status
    {
        get => _status;
        set { _status = value; OnPropertyChanged(); OnPropertyChanged(nameof(DisplayColor)); OnPropertyChanged(nameof(TextColor)); OnPropertyChanged(nameof(IsAvailable)); }
    }

    public bool IsSelected
    {
        get => _isSelected;
        set
        {
            if (_isSelected == value) return;
            _isSelected = value;
            OnPropertyChanged();
            OnPropertyChanged(nameof(DisplayColor));
            OnPropertyChanged(nameof(TextColor));
        }
    }

    public bool IsAvailable => Status != "booked";

    public Color DisplayColor
    {
        get
        {
            if (Status == "booked") return Color.FromArgb("#D1D5DB");
            if (IsSelected) return Color.FromArgb("#2563EB");
            return Color.FromArgb("#22C55E");
        }
    }

    public Color TextColor
    {
        get
        {
            if (Status == "booked") return Color.FromArgb("#6B7280");
            if (IsSelected) return Colors.White;
            return Colors.White;
        }
    }

    public event PropertyChangedEventHandler? PropertyChanged;
    protected void OnPropertyChanged([CallerMemberName] string? name = null)
        => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
}

public class PaymentModel
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string Status { get; set; } = "PENDING";
    public string? PaymentMethod { get; set; }
    public string? TransactionId { get; set; }
    public DateTime? PaidAt { get; set; }
}

public class CreatePaymentRequest
{
    public string BookingId { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public string? PaymentMethod { get; set; }
}

public class TicketModel
{
    public string Id { get; set; } = string.Empty;
    public string BookingId { get; set; } = string.Empty;
    public string TripId { get; set; } = string.Empty;
    public int SeatNumber { get; set; }
    public string? QrCode { get; set; }
    public bool IsUsed { get; set; }
    public DateTime? UsedAt { get; set; }
    public TripModel? Trip { get; set; }
    public BookingModel? Booking { get; set; }
}

public class FavoriteModel
{
    public string Id { get; set; } = string.Empty;
    public string UserId { get; set; } = string.Empty;
    public string RouteId { get; set; } = string.Empty;
    public RouteModel? Route { get; set; }
}

public class SeatsInfo
{
    public int TotalSeats { get; set; }
    public int BookedSeats { get; set; }
    public int AvailableSeats { get; set; }
}

public class ApiErrorResponse
{
    public string? Message { get; set; }
    public int StatusCode { get; set; }
}