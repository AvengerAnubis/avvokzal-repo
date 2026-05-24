using AvtovokzalMobileApp.Views;

namespace AvtovokzalMobileApp;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();

        Routing.RegisterRoute("login", typeof(LoginPage));
        Routing.RegisterRoute("register", typeof(RegisterPage));
        Routing.RegisterRoute("booking", typeof(BookingPage));
        Routing.RegisterRoute("payment", typeof(PaymentPage));
        Routing.RegisterRoute("ticket", typeof(TicketPage));
    }
}