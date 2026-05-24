using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Models;
using AvtovokzalMobileApp.Services;
using System.Collections.ObjectModel;

namespace AvtovokzalMobileApp.ViewModels;

[QueryProperty(nameof(BookingId), "bookingId")]
public partial class TicketViewModel : BaseViewModel
{
    private readonly ITicketService _ticketService;
    private readonly IBookingService _bookingService;
    private readonly IQrCodeService _qrCodeService;
    private readonly IOfflineStorageService _offlineStorage;

    [ObservableProperty]
    private string _bookingId = string.Empty;

    [ObservableProperty]
    private ObservableCollection<TicketModel> _tickets = new();

    [ObservableProperty]
    private BookingModel? _booking;

    [ObservableProperty]
    private ImageSource? _qrCodeImage;

    [ObservableProperty]
    private bool _isFromCache;

    public TicketViewModel(ITicketService ticketService, IBookingService bookingService,
        IQrCodeService qrCodeService, IOfflineStorageService offlineStorage)
    {
        _ticketService = ticketService;
        _bookingService = bookingService;
        _qrCodeService = qrCodeService;
        _offlineStorage = offlineStorage;
        Title = "Электронный билет";
    }

    partial void OnBookingIdChanged(string value)
    {
        if (!string.IsNullOrEmpty(value))
            _ = LoadTicketAsync();
    }

    private async Task LoadTicketAsync()
    {
        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var booking = await _bookingService.GetBookingAsync(BookingId);
            if (booking != null)
            {
                Booking = booking;

                var tickets = await _ticketService.GetTicketsByBookingAsync(BookingId);
                Tickets = new ObservableCollection<TicketModel>(tickets ?? new List<TicketModel>());

                if (tickets?.Count > 0 && !string.IsNullOrEmpty(tickets[0].QrCode))
                {
                    QrCodeImage = _qrCodeService.GenerateQrCode(tickets[0].QrCode);
                }

                foreach (var t in tickets ?? new List<TicketModel>())
                {
                    t.Booking = booking;
                    await _offlineStorage.SaveTicketAsync(t);
                }

                IsFromCache = false;
            }
            else
            {
                await LoadFromCacheAsync();
            }
        }
        catch
        {
            await LoadFromCacheAsync();
        }
        finally
        {
            IsBusy = false;
        }
    }

    private async Task LoadFromCacheAsync()
    {
        var cached = await _offlineStorage.GetCachedTicketsAsync();
        var match = cached.FirstOrDefault(t => t.BookingId == BookingId);
        if (match != null)
        {
            Booking = match.Booking;
            Tickets = new ObservableCollection<TicketModel> { match };
            if (!string.IsNullOrEmpty(match.QrCode))
                QrCodeImage = _qrCodeService.GenerateQrCode(match.QrCode);
            IsFromCache = true;
            ConnectionWarning = "Сервер недоступен. Показана сохранённая копия билета.";
        }
        else
        {
            ErrorMessage = "Билет не найден. Сервер недоступен.";
        }
    }

    [RelayCommand]
    private async Task GoBackAsync()
    {
        await Shell.Current.GoToAsync("..");
    }
}