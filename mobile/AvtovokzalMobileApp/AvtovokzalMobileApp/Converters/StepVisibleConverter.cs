using System.Globalization;

namespace AvtovokzalMobileApp.Converters;

public class StepVisibleConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is not int currentStep) return false;
        if (parameter is not string stepStr) return false;
        return int.TryParse(stepStr, out var step) && currentStep == step;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture) => throw new NotImplementedException();
}