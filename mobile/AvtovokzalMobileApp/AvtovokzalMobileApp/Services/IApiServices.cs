using AvtovokzalMobileApp.Models;

namespace AvtovokzalMobileApp.Services;

public interface IRouteService
{
    Task<List<RouteModel>> GetRoutesAsync();
    Task<List<RouteModel>> SearchRoutesAsync(string origin, string destination);
    Task<RouteModel?> GetRouteAsync(string id);
    Task<List<TripModel>> GetTripsAsync(string? routeId = null);
    Task<List<TripModel>> GetTripsByRouteAsync(string routeId);
    Task<SeatsInfo?> GetSeatsAsync(string tripId);
    Task<SeatMapResponse?> GetSeatMapAsync(string tripId);
}

public interface IBookingService
{
    Task<BookingModel?> CreateBookingAsync(CreateBookingRequest request);
    Task<List<BookingModel>> GetUserBookingsAsync(string userId);
    Task<BookingModel?> GetBookingAsync(string id);
    Task<BookingModel?> ConfirmBookingAsync(string id);
    Task<BookingModel?> CancelBookingAsync(string id);
}

public interface IPaymentService
{
    Task<PaymentModel?> CreatePaymentAsync(CreatePaymentRequest request);
    Task<PaymentModel?> ProcessPaymentAsync(string paymentId);
    Task<PaymentModel?> GetPaymentByBookingAsync(string bookingId);
}

public interface ITicketService
{
    Task<List<TicketModel>> GetUserTicketsAsync(string userId);
    Task<TicketModel?> GetTicketAsync(string id);
    Task<List<TicketModel>> GetTicketsByBookingAsync(string bookingId);
}

public interface IFavoriteService
{
    Task<List<FavoriteModel>> GetFavoritesAsync(string userId);
    Task<bool> AddFavoriteAsync(string userId, string routeId);
    Task<bool> RemoveFavoriteAsync(string userId, string routeId);
    Task<bool> CheckFavoriteAsync(string userId, string routeId);
}

public interface IUserService
{
    Task<UserInfo?> GetUserAsync(string id);
    Task<UserInfo?> UpdateUserAsync(string id, string? firstName, string? lastName, string? phone);
}