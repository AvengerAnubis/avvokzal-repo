using System.Globalization;

namespace AvtovokzalMobileApp.Converters;

public class RadioConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is string selected && parameter is string option)
            return selected == option;
        return false;
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool isChecked && isChecked && parameter is string option)
            return option;
        return Binding.DoNothing;
    }
}