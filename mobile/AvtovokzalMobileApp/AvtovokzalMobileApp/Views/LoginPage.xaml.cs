using AvtovokzalMobileApp.ViewModels;

namespace AvtovokzalMobileApp.Views;

public partial class LoginPage : ContentPage
{
    public LoginPage(LoginViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }
}