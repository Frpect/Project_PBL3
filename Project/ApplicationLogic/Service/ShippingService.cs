namespace Project.ApplicationLogic.Service;

public class ShippingService : IShippingService
{
    private static readonly string[] RemoteKeywords =
    {
        "cà mau", "ca mau", "an giang", "điện biên", "dien bien", "lai châu", "lai chau",
        "hà giang", "ha giang", "cao bằng", "cao bang", "kon tum"
    };

    public decimal GetShippingFee(string? address)
    {
        if (string.IsNullOrWhiteSpace(address))
            return 30_000m;

        var a = address.ToLowerInvariant();
        if (RemoteKeywords.Any(k => a.Contains(k)))
            return 50_000m;

        return 30_000m;
    }
}
