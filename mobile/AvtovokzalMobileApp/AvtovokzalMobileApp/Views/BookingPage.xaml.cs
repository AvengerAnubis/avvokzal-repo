using AvtovokzalMobileApp.ViewModels;

namespace AvtovokzalMobileApp.Views;

public partial class BookingPage : ContentPage
{
    public BookingPage(BookingViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}