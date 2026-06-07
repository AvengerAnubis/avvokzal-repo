using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AvtovokzalMobileApp.Services;

namespace AvtovokzalMobileApp.ViewModels;

public partial class RegisterViewModel : BaseViewModel
{
    private readonly IAuthService _authService;

    [ObservableProperty]
    private string _email = string.Empty;

    [ObservableProperty]
    private string _password = string.Empty;

    [ObservableProperty]
    private string _confirmPassword = string.Empty;

    [ObservableProperty]
    private string _firstName = string.Empty;

    [ObservableProperty]
    private string _lastName = string.Empty;

    [ObservableProperty]
    private string _phone = string.Empty;

    public RegisterViewModel(IAuthService authService)
    {
        _authService = authService;
        Title = "Регистрация";
    }

    [RelayCommand]
    private async Task RegisterAsync()
    {
        if (string.IsNullOrWhiteSpace(Email) || string.IsNullOrWhiteSpace(Password) ||
            string.IsNullOrWhiteSpace(FirstName) || string.IsNullOrWhiteSpace(LastName))
        {
            ErrorMessage = "Заполните обязательные поля";
            return;
        }

        if (Password != ConfirmPassword)
        {
            ErrorMessage = "Пароли не совпадают";
            return;
        }

        if (Password.Length < 6)
        {
            ErrorMessage = "Пароль должен быть не менее 6 символов";
            return;
        }

        IsBusy = true;
        ErrorMessage = null;

        try
        {
            var result = await _authService.RegisterAsync(
                Email.Trim(), Password, FirstName.Trim(), LastName.Trim(),
                string.IsNullOrWhiteSpace(Phone) ? null : Phone.Trim());

            if (result != null)
            {
                await Shell.Current.GoToAsync("//main");
            }
            else
            {
                ErrorMessage = "Ошибка при регистрации. Возможно, email уже занят";
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
    private async Task GoToLoginAsync()
    {
        await Shell.Current.GoToAsync("..");
    }
}