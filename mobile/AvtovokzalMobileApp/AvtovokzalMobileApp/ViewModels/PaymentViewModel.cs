using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Models;
using AvtovokzalMobileApp.Services;

namespace AvtovokzalMobileApp.ViewModels;

[QueryProperty(nameof(BookingId), "bookingId")]
public partial class PaymentViewModel : BaseViewModel
{
    private readonly IPaymentService _paymentService;
    private readonly IBookingService _bookingService;

    [ObservableProperty]
    private string _bookingId = string.Empty;

    [ObservableProperty]
    private BookingModel? _booking;

    [ObservableProperty]
    private string _selectedMethod = "card";

    [ObservableProperty]
    private bool _isPaymentComplete;

    [ObservableProperty]
    private PaymentModel? _payment;

    public PaymentViewModel(IPaymentService paymentService, IBookingService bookingService)
    {
        _paymentService = paymentService;
        _bookingService = bookingService;
        Title = "Оплата";
    }

    partial void OnBookingIdChanged(string value)
    {
        if (!string.IsNullOrEmpty(value))
            _ = LoadBookingAsync();
    }

    private async Task LoadBookingAsync()
    {
        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var booking = await _bookingService.GetBookingAsync(BookingId);
            if (booking != null)
            {
                Booking = booking;
            }
        }
        catch
        {
            ErrorMessage = "Не удалось загрузить информацию о брони";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task ProcessPaymentAsync()
    {
        if (Booking == null) return;

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var payment = await _paymentService.CreatePaymentAsync(new CreatePaymentRequest
            {
                BookingId = Booking.Id,
                Amount = Booking.TotalPrice,
                PaymentMethod = SelectedMethod
            });

            if (payment != null)
            {
                var processed = await _paymentService.ProcessPaymentAsync(payment.Id);
                if (processed != null)
                {
                    Payment = processed;
                    IsPaymentComplete = true;

                    try
                    {
                        await _bookingService.ConfirmBookingAsync(Booking.Id);
                    }
                    catch
                    {
                    }
                }
                else
                {
                    ErrorMessage = "Ошибка при обработке платежа";
                }
            }
            else
            {
                ErrorMessage = "Ошибка при создании платежа";
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
    private async Task GoToTicketAsync()
    {
        if (Booking == null) return;
        await Shell.Current.GoToAsync($"ticket?bookingId={Booking.Id}");
    }

    [RelayCommand]
    private async Task GoToProfileAsync()
    {
        await Shell.Current.GoToAsync("//profile");
    }
}
