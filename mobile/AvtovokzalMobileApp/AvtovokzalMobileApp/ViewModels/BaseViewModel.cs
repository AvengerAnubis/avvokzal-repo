using CommunityToolkit.Mvvm.ComponentModel;

namespace AvtovokzalMobileApp.ViewModels;

public partial class BaseViewModel : ObservableObject, IDisposable
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

    private readonly List<Action> _cleanupActions = new();

    protected void AddCleanup(Action cleanup)
    {
        _cleanupActions.Add(cleanup);
    }

    public virtual void Dispose()
    {
        foreach (var action in _cleanupActions)
            action();
        _cleanupActions.Clear();
        GC.SuppressFinalize(this);
    }
}
