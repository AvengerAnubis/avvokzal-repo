using CommunityToolkit.Mvvm.ComponentModel;

namespace AvtovokzalMobileApp.ViewModels;

public partial class BaseViewModel : ObservableObject
{
    [ObservableProperty]
    private bool _isBusy;

    [ObservableProperty]
    private string _title = string.Empty;

    [ObservableProperty]
    private string? _errorMessage;

    [ObservableProperty]
    private bool _isServerOnline = true;

    [ObservableProperty]
    private string? _connectionWarning;
}