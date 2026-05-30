namespace Project.ApplicationLogic.DTOs
{
    public class TopProductResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int QuantitySold { get; set; }
    }
}