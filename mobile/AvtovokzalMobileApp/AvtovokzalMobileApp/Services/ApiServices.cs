using AvtovokzalMobileApp.Models;

namespace AvtovokzalMobileApp.Services;

public class RouteService : IRouteService
{
    private readonly IApiService _api;
    public RouteService(IApiService api) => _api = api;

    public Task<List<RouteModel>> GetRoutesAsync() => _api.GetAsync<List<RouteModel>>("/api/routes") ?? Task.FromResult(new List<RouteModel>());
    public Task<List<RouteModel>> SearchRoutesAsync(string origin, string destination) => _api.GetAsync<List<RouteModel>>($"/api/routes/search?origin={Uri.EscapeDataString(origin)}&destination={Uri.EscapeDataString(destination)}") ?? Task.FromResult(new List<RouteModel>());
    public Task<RouteModel?> GetRouteAsync(string id) => _api.GetAsync<RouteModel>($"/api/routes/{id}");
    public Task<List<TripModel>> GetTripsAsync(string? routeId = null) => _api.GetAsync<List<TripModel>>(routeId != null ? $"/api/trips?routeId={routeId}" : "/api/trips") ?? Task.FromResult(new List<TripModel>());
    public Task<List<TripModel>> GetTripsByRouteAsync(string routeId) => _api.GetAsync<List<TripModel>>($"/api/trips/route/{routeId}") ?? Task.FromResult(new List<TripModel>());
    public Task<SeatsInfo?> GetSeatsAsync(string tripId) => _api.GetAsync<SeatsInfo>($"/api/trips/{tripId}/seats");
    public Task<SeatMapResponse?> GetSeatMapAsync(string tripId) => _api.GetAsync<SeatMapResponse>($"/api/trips/{tripId}/seats");
}

public class BookingService : IBookingService
{
    private readonly IApiService _api;
    public BookingService(IApiService api) => _api = api;

    public Task<BookingModel?> CreateBookingAsync(CreateBookingRequest request) => _api.PostAsync<BookingModel>("/api/bookings", request);
    public Task<List<BookingModel>> GetUserBookingsAsync(string userId) => _api.GetAsync<List<BookingModel>>($"/api/bookings/user/{userId}") ?? Task.FromResult(new List<BookingModel>());
    public Task<BookingModel?> GetBookingAsync(string id) => _api.GetAsync<BookingModel>($"/api/bookings/{id}");
    public Task<BookingModel?> ConfirmBookingAsync(string id) => _api.PutAsync<BookingModel>($"/api/bookings/{id}/confirm");
    public Task<BookingModel?> CancelBookingAsync(string id) => _api.PutAsync<BookingModel>($"/api/bookings/{id}/cancel");
}

public class PaymentService : IPaymentService
{
    private readonly IApiService _api;
    public PaymentService(IApiService api) => _api = api;

    public Task<PaymentModel?> CreatePaymentAsync(CreatePaymentRequest request) => _api.PostAsync<PaymentModel>("/api/payments", request);
    public Task<PaymentModel?> ProcessPaymentAsync(string paymentId) => _api.PostAsync<PaymentModel>($"/api/payments/{paymentId}/process");
    public Task<PaymentModel?> GetPaymentByBookingAsync(string bookingId) => _api.GetAsync<PaymentModel>($"/api/payments/booking/{bookingId}");
}

public class TicketService : ITicketService
{
    private readonly IApiService _api;
    public TicketService(IApiService api) => _api = api;

    public Task<List<TicketModel>> GetUserTicketsAsync(string userId) => _api.GetAsync<List<TicketModel>>($"/api/tickets?userId={userId}") ?? Task.FromResult(new List<TicketModel>());
    public Task<TicketModel?> GetTicketAsync(string id) => _api.GetAsync<TicketModel>($"/api/tickets/{id}");
    public Task<List<TicketModel>> GetTicketsByBookingAsync(string bookingId) => _api.GetAsync<List<TicketModel>>($"/api/tickets/booking/{bookingId}") ?? Task.FromResult(new List<TicketModel>());
}

public class FavoriteService : IFavoriteService
{
    private readonly IApiService _api;
    public FavoriteService(IApiService api) => _api = api;

    public Task<List<FavoriteModel>> GetFavoritesAsync(string userId) => _api.GetAsync<List<FavoriteModel>>($"/api/favorites?userId={userId}") ?? Task.FromResult(new List<FavoriteModel>());
    public Task<bool> AddFavoriteAsync(string userId, string routeId) => _api.PostAsync<bool>($"/api/favorites/{routeId}?userId={userId}");
    public Task<bool> RemoveFavoriteAsync(string userId, string routeId) => _api.DeleteAsync($"/api/favorites/{routeId}?userId={userId}");
    public async Task<bool> CheckFavoriteAsync(string userId, string routeId)
    {
        var result = await _api.GetAsync<Dictionary<string, object>>($"/api/favorites/check/{routeId}?userId={userId}");
        return result != null && result.ContainsKey("isFavorite") && result["isFavorite"] is bool b && b;
    }
}

public class UserService : IUserService
{
    private readonly IApiService _api;
    public UserService(IApiService api) => _api = api;

    public Task<UserInfo?> GetUserAsync(string id) => _api.GetAsync<UserInfo>($"/api/users/{id}");
    public Task<UserInfo?> UpdateUserAsync(string id, string? firstName, string? lastName, string? phone)
        => _api.PutAsync<UserInfo>($"/api/users/{id}", new { firstName, lastName, phone });
}