using AvtovokzalMobileApp.ViewModels;

namespace AvtovokzalMobileApp.Views;

public partial class RegisterPage : ContentPage
{
    public RegisterPage(RegisterViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}