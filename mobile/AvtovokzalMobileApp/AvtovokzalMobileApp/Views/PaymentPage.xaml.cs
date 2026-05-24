using AvtovokzalMobileApp.ViewModels;

namespace AvtovokzalMobileApp.Views;

public partial class PaymentPage : ContentPage
{
    public PaymentPage(PaymentViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}