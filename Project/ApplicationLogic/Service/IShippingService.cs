namespace Project.ApplicationLogic.Service;

public interface IShippingService
{
    decimal GetShippingFee(string? address);
}
