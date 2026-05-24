using AvtovokzalMobileApp.ViewModels;

namespace AvtovokzalMobileApp.Views;

public partial class TicketPage : ContentPage
{
    public TicketPage(TicketViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}