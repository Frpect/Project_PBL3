namespace Project.ApplicationLogic.DTOs
{
    public class LowStockResponse
    {
        public int VariantId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public int StockQuantity { get; set; }
    }
}