namespace Project.ApplicationLogic.DTOs
{
    public class ShippingFeeResponse
    {
        public decimal Fee { get; set; }
        public string Currency { get; set; } = "VND";
    }
}