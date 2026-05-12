namespace Project.ApplicationLogic.DTOs
{
    public class InventoryTransactionResponse
    {
        public int TransactionId { get; set; }
        public int VariantId { get; set; }
        public string ProductName { get; set; }
        public string Sku { get; set; }
        public int Quantity { get; set; }
        public string Type { get; set; }
        public string Note { get; set; }
        public DateTime? CreatedAt { get; set; }
    }
}
