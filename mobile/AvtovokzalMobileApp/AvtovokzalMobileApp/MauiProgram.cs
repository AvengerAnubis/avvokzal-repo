using Microsoft.Extensions.Logging;
using AvtovokzalMobileApp.Services;
using AvtovokzalMobileApp.ViewModels;
using AvtovokzalMobileApp.Views;

namespace AvtovokzalMobileApp;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

        // HTTP clients
        builder.Services.AddHttpClient<IApiService, ApiService>(client =>
        {
            client.BaseAddress = new Uri("https://avvokzal-repo-api.vercel.app");
            client.Timeout = TimeSpan.FromSeconds(15);
        });

        builder.Services.AddHttpClient<IApiHealthService, ApiHealthService>(client =>
        {
            client.BaseAddress = new Uri("https://avvokzal-repo-api.vercel.app");
            client.Timeout = TimeSpan.FromSeconds(10);
        });

        // Services
        builder.Services.AddSingleton<IAuthService, AuthService>();
        builder.Services.AddSingleton<IRouteService, RouteService>();
        builder.Services.AddSingleton<IBookingService, BookingService>();
        builder.Services.AddSingleton<IPaymentService, PaymentService>();
        builder.Services.AddSingleton<ITicketService, TicketService>();
        builder.Services.AddSingleton<IFavoriteService, FavoriteService>();
        builder.Services.AddSingleton<IUserService, UserService>();
        builder.Services.AddSingleton<IQrCodeService, QrCodeService>();
        builder.Services.AddSingleton<IOfflineStorageService, OfflineStorageService>();

        // ViewModels
        builder.Services.AddTransient<LoginViewModel>();
        builder.Services.AddTransient<RegisterViewModel>();
        builder.Services.AddTransient<MainViewModel>();
        builder.Services.AddTransient<BookingViewModel>();
        builder.Services.AddTransient<PaymentViewModel>();
        builder.Services.AddTransient<TicketViewModel>();
        builder.Services.AddTransient<ProfileViewModel>();

        // Pages
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<RegisterPage>();
        builder.Services.AddTransient<MainPage>();
        builder.Services.AddTransient<BookingPage>();
        builder.Services.AddTransient<PaymentPage>();
        builder.Services.AddTransient<TicketPage>();
        builder.Services.AddTransient<ProfilePage>();

#if DEBUG
        builder.Logging.AddDebug();
#endif

        return builder.Build();
    }
}