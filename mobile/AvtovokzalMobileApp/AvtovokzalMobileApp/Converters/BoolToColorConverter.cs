using System.Globalization;

namespace AvtovokzalMobileApp.Converters;

public class BoolToColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is bool boolValue && boolValue)
            return Color.FromArgb("#22C55E");
        return Color.FromArgb("#EF4444");
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class StatusToColorConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value?.ToString() switch
        {
            "CONFIRMED" or "COMPLETED" => Color.FromArgb("#22C55E"),
            "PENDING" => Color.FromArgb("#EAB308"),
            "CANCELLED" => Color.FromArgb("#EF4444"),
            "DELAYED" => Color.FromArgb("#EAB308"),
            "SCHEDULED" => Color.FromArgb("#2563EB"),
            _ => Color.FromArgb("#64748B")
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class StatusToTextConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        return value?.ToString() switch
        {
            "CONFIRMED" => "Подтверждён",
            "COMPLETED" => "Завершён",
            "PENDING" => "Ожидает оплаты",
            "CANCELLED" => "Отменён",
            "SCHEDULED" => "По расписанию",
            "DELAYED" => "Задержан",
            "IN_PROGRESS" => "В пути",
            _ => value?.ToString() ?? ""
        };
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class InverseBoolConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is bool b ? !b : value;

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is bool b ? !b : value;
}

public class PriceFormatConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
        => value is decimal price ? $"{price:N0} ₽" : "0 ₽";

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class DateFormatConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is DateTime dt)
            return dt.ToString("dd.MM.yyyy HH:mm");
        return "";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}

public class TimeFormatConverter : IValueConverter
{
    public object? Convert(object? value, Type targetType, object? parameter, CultureInfo culture)
    {
        if (value is DateTime dt)
            return dt.ToString("HH:mm");
        return "";
    }

    public object? ConvertBack(object? value, Type targetType, object? parameter, CultureInfo culture)
        => throw new NotImplementedException();
}