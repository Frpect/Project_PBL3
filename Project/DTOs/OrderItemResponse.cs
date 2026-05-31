namespace Project.ApplicationLogic.DTOs
{
    public class OrderItemResponse
    {
        public int VariantId { get; set; }
        public string ProductName { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string? Image { get; set; }
        public decimal Subtotal => Price * Quantity;
    }
}
