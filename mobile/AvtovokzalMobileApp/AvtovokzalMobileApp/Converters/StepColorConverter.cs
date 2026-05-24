using System.Globalization;

namespace AvtovokzalMobileApp.Converters;

public class StepColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not int currentStep) return Color.FromArgb("#E2E8F0");
        if (parameter is not string stepStr) return Color.FromArgb("#E2E8F0");
        if (!int.TryParse(stepStr, out var step)) return Color.FromArgb("#E2E8F0");

        if (currentStep > step)
            return Color.FromArgb("#22C55E");
        if (currentStep == step)
            return Color.FromArgb("#2563EB");
        return Color.FromArgb("#CBD5E1");
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotImplementedException();
}