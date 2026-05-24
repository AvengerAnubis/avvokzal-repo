using QRCoder;

namespace AvtovokzalMobileApp.Services;

public interface IQrCodeService
{
    ImageSource? GenerateQrCode(string data);
}

public class QrCodeService : IQrCodeService
{
    public ImageSource? GenerateQrCode(string data)
    {
        try
        {
            using var generator = new QRCodeGenerator();
            var qrData = generator.CreateQrCode(data, QRCodeGenerator.ECCLevel.Q);
            using var qrCode = new BitmapByteQRCode(qrData);
            var bytes = qrCode.GetGraphic(20);
            return ImageSource.FromStream(() => new MemoryStream(bytes));
        }
        catch
        {
            return null;
        }
    }
}