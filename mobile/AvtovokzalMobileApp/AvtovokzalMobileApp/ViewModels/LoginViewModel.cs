using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Services;

namespace AvtovokzalMobileApp.ViewModels;

public partial class LoginViewModel : BaseViewModel
{
    private readonly IAuthService _authService;

    [ObservableProperty]
    private string _email = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    public LoginViewModel(IAuthService authService)
    {
        _authService = authService;
        Title = "Вход";
    }

    [RelayCommand]
    private async Task LoginAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password))
        {
            ErrorMessage = "Заполните все поля";
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var result = await _authService.LoginAsync(Email.Trim(), Password);
            if (result != null)
            {
                await Shell.Current.GoToAsync("//main");
            }
            else
            {
                ErrorMessage = "Неверный email или пароль";
            }
        }
        catch
        {
            ErrorMessage = "Ошибка подключения к серверу";
        }
        finally
        {
            IsBusy = false;
        }
    }

    [RelayCommand]
    private async Task GoToRegisterAsync()
    {
        await Shell.Current.GoToAsync("register");
    }
}