namespace Project.ApplicationLogic.DTOs
{
    public class InventoryResponse
    {
        public int InventoryId { get; set; }
        public int VariantId { get; set; }
        public string ProductName { get; set; }
        public string Sku { get; set; }
        public string Size { get; set; }
        public string Color { get; set; }
        public int Quantity { get; set; }
        public DateTime? LastUpdated { get; set; }
    }
}
