using AvtovokzalMobileApp.Services;

namespace AvtovokzalMobileApp
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();
        }

        protected override Window CreateWindow(IActivationState? activationState)
        {
            var shell = new AppShell();
            return new Window(shell);
        }

        protected override void OnStart()
        {
            base.OnStart();
            var authService = Handler?.MauiContext?.Services.GetService<IAuthService>();
            if (authService != null)
                _ = authService.InitializeAsync();
        }
    }
}
