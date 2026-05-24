using AvtovokzalMobileApp.ViewModels;
using AvtovokzalMobileApp.Services;

namespace AvtovokzalMobileApp.Views;

public partial class MainPage : ContentPage
{
    private readonly MainViewModel _viewModel;
    private readonly IApiHealthService _healthService;

    public MainPage(MainViewModel viewModel, IApiHealthService healthService)
    {
        InitializeComponent();
        _viewModel = viewModel;
        _healthService = healthService;
        BindingContext = viewModel;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();

        await _healthService.CheckHealthAsync();

        if (_viewModel.Routes.Count == 0 && _viewModel.IsServerOnline)
            await _viewModel.LoadRoutesCommand.ExecuteAsync(null);
    }
}